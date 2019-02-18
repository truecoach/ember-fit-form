import sinon from 'sinon';
import { module, test } from 'qunit';
import { defer } from 'rsvp';
import { get } from '@ember/object';
import { setupTest } from 'ember-qunit';

module('Unit | Component | form-adapters/base', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.component = this.owner.factoryFor('component:fit-form').create({ adapter: 'base' });
  });

  function assertFormProps(assert, form, assertions = {}) {
    Object.keys(assertions).forEach((k) => {
      assert.equal(get(form, k), assertions[k]);
    });
  }

  module('without models', function(hooks) {
    hooks.beforeEach(function() {
      this.form = this.component.get('formObject');
    });

    test('the default state', function(assert) {
      assert.ok(this.component);
      assert.ok(this.form);
      assert.deepEqual(this.form.get('models'), []);

      assertFormProps(assert, this.form, {
        isDirty: false,      // Dirtiness
        isInvalid: false,    // Validity
        isSubmittable: false // Submittability
      });
    });

    module('submit the form', function(hooks) {
      hooks.beforeEach(function() {
        this.deferred = defer();
        this.onsubmit = sinon.stub(this.form, "onsubmit").returns(this.deferred.promise);
        this.onsuccess = sinon.spy(this.form, "onsuccess");
        this.onerror = sinon.spy(this.form, "onerror");
      });

      test('while submitting', function(assert) {
        this.form.submit();

        assertFormProps(assert, this.form, {
          isSubmittable: false, // Submittability
          isSubmitting: true    // Submittability
        });

        assert.ok(this.onsubmit.calledOnce, "onsubmit was called");

        const onsubmitArgs = this.onsubmit.getCall(0).args;
        assert.equal(onsubmitArgs.length, 1, "onsubmit called with one argument");
        assert.equal(onsubmitArgs[0], this.form, "onsubmit called with the 'form' as the first argument");
      });

      test('submitting the form is fulfilled', async function(assert) {
        const submission = this.form.submit();

        this.deferred.resolve(42);

        await submission;

        assert.ok(this.onsubmit.calledOnce, "onsubmit was called");
        assert.ok(this.onsuccess.calledOnce, "onsuccess was called");
        assert.notOk(this.onerror.called, "onerror was never called");

        const onsuccessArgs = this.onsuccess.getCall(0).args;
        assert.equal(onsuccessArgs.length, 2, "onsuccess called with two arguments");
        assert.equal(onsuccessArgs[0], 42, "onsuccess called with the submit result as the first argument");
        assert.equal(onsuccessArgs[1], this.form, "onsuccess called with the 'form' as the second argument");
      });

      test('submitting the form is rejected', async function(assert) {
        const submission = this.form.submit();

        this.deferred.reject("error");

        await submission;

        assert.ok(this.onsubmit.calledOnce, "onsubmit was called");
        assert.ok(this.onerror.calledOnce, "onerror was called");
        assert.notOk(this.onsuccess.called, "onsuccess was never called");

        const onerrorArgs = this.onerror.getCall(0).args;
        assert.equal(onerrorArgs.length, 2, "onerror called with two arguments");
        assert.equal(onerrorArgs[0], "error", "onerror called with the submit error as the first argument");
        assert.equal(onerrorArgs[1], this.form, "onerror called with the 'form' as the second argument");
      });
    });

    test('cancel the form', async function(assert) {
      const deferred = defer();
      const oncancel = sinon.stub(this.form, "oncancel").returns(deferred.promise);

      assertFormProps(assert, this.form, { isCancelling: false });

      const cancellation = this.form.cancel();

      assertFormProps(assert, this.form, { isCancelling: true });

      assert.ok(oncancel.calledOnce, "oncancel was called");

      const oncancelArgs = oncancel.getCall(0).args;
      assert.equal(oncancelArgs.length, 1, "oncancel called with one argument");
      assert.equal(oncancelArgs[0], this.form, "oncancel called with the 'form' as the first argument");

      deferred.resolve();
      await cancellation;

      assertFormProps(assert, this.form, { isCancelling: false });
    });

    test('validate the form', async function(assert) {
      const deferred = defer();
      const onvalidate = sinon.stub(this.form, "onvalidate").returns(deferred.promise);

      assertFormProps(assert, this.form, { isValidating: false });

      const validation = this.form.validate();

      assertFormProps(assert, this.form, { isValidating: true });

      assert.ok(onvalidate.calledOnce, "onvalidate was called");

      const onvalidateArgs = onvalidate.getCall(0).args;
      assert.equal(onvalidateArgs.length, 1, "onvalidate called with one argument");
      assert.equal(onvalidateArgs[0], this.form, "onvalidate called with the 'form' as the first argument");

      deferred.resolve();
      await validation;

      assertFormProps(assert, this.form, { isValidating: false });
    });
  });

  module('with a model', function(hooks) {
    hooks.beforeEach(function() {
      this.model = {};
      this.component.set('models', this.model);
      this.form = this.component.get('formObject');
    });

    test('the default state', function(assert) {
      assert.ok(this.component);
      assert.ok(this.form);
      assert.deepEqual(this.form.get('models'), [ this.model ]);
    });
  });

  module('with many models', function(hooks) {
    hooks.beforeEach(function() {
      this.models = [{}, {}];
      this.component.set('models', this.models);
      this.form = this.component.get('formObject');
    });

    test('the default state', function(assert) {
      assert.ok(this.component);
      assert.ok(this.form);
      assert.deepEqual(this.form.get('models'), this.models);
    });
  });
});

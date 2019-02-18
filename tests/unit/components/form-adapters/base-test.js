import sinon from 'sinon';
import { module, test } from 'qunit';
import { defer } from 'rsvp';
import { get } from '@ember/object';
import { run } from '@ember/runloop';
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

    module('validate the form', function(hooks) {
      hooks.beforeEach(function() {
        this.deferred = defer();
        this.onvalidate = sinon.stub(this.form, "onvalidate").returns(this.deferred.promise);
        this.oninvalid = sinon.spy(this.form, "oninvalid");
      });

      test('while validating', function(assert) {
        this.form.validate();

        assertFormProps(assert, this.form, {
          isValidating: true
        });

        assert.ok(this.onvalidate.calledOnce, "onvalidate was called");

        const onvalidateArgs = this.onvalidate.getCall(0).args;
        assert.equal(onvalidateArgs.length, 1, "onvalidate called with one argument");
        assert.equal(onvalidateArgs[0], this.form, "onvalidate called with the 'form' as the first argument");
      });

      test('validating the form is fulfilled', async function(assert) {
        const validation = this.form.validate();

        this.deferred.resolve(42);

        await validation;

        assert.ok(this.onvalidate.calledOnce, "onvalidate was called");
        assert.notOk(this.oninvalid.called, "oninvalid was never called");
      });

      test('validating the form is fulfilled with false', async function(assert) {
        const validation = this.form.validate();

        this.deferred.resolve(false);

        await validation;

        assert.ok(this.onvalidate.calledOnce, "onvalidate was called");
        assert.ok(this.oninvalid.calledOnce, "oninvalid was called");

        const oninvalidArgs = this.oninvalid.getCall(0).args;
        assert.equal(oninvalidArgs[0], undefined, "oninvalid called with undefined as the first argument");
        assert.equal(oninvalidArgs[1], this.form, "oninvalid called with the 'form' as the second argument");
      });

      test('validating the form returns false', async function(assert) {
        this.onvalidate.returns(false);
        const validation = run(() => this.form.validate() );

        await validation;

        assert.ok(this.onvalidate.calledOnce, "onvalidate was called");
        assert.ok(this.oninvalid.calledOnce, "oninvalid was called");

        const oninvalidArgs = this.oninvalid.getCall(0).args;
        assert.equal(oninvalidArgs[0], undefined, "oninvalid called with undefined as the first argument");
        assert.equal(oninvalidArgs[1], this.form, "oninvalid called with the 'form' as the second argument");
      });

      test('validating the form is rejected', async function(assert) {
        const validation = this.form.validate();

        this.deferred.reject("invalid");

        await validation;

        assert.ok(this.onvalidate.calledOnce, "onvalidate was called");
        assert.ok(this.oninvalid.calledOnce, "oninvalid was called");

        const oninvalidArgs = this.oninvalid.getCall(0).args;
        assert.equal(oninvalidArgs.length, 2, "oninvalid called with two arguments");
        assert.equal(oninvalidArgs[0], "invalid", "oninvalid called with the validate invalidation as the first argument");
        assert.equal(oninvalidArgs[1], this.form, "oninvalid called with the 'form' as the second argument");
      });
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

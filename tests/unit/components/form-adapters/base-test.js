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
        this.onSubmit = sinon.stub(this.form, "onSubmit").returns(this.deferred.promise);
        this.onSuccess = sinon.spy(this.form, "onSuccess");
        this.onError = sinon.spy(this.form, "onError");
      });

      test('while submitting', function(assert) {
        this.form.submit();

        assertFormProps(assert, this.form, {
          isSubmittable: false, // Submittability
          isSubmitting: true    // Submittability
        });

        assert.ok(this.onSubmit.calledOnce, "onSubmit was called");

        const onSubmitArgs = this.onSubmit.getCall(0).args;
        assert.equal(onSubmitArgs.length, 1, "onSubmit called with one argument");
        assert.equal(onSubmitArgs[0], this.form, "onSubmit called with the 'form' as the first argument");
      });

      test('submitting the form is fulfilled', async function(assert) {
        const submission = this.form.submit();

        this.deferred.resolve(42);

        await submission;

        assert.ok(this.onSubmit.calledOnce, "onSubmit was called");
        assert.ok(this.onSuccess.calledOnce, "onSuccess was called");
        assert.notOk(this.onError.called, "onError was never called");

        const onSuccessArgs = this.onSuccess.getCall(0).args;
        assert.equal(onSuccessArgs.length, 2, "onSuccess called with two arguments");
        assert.equal(onSuccessArgs[0], 42, "onSuccess called with the submit result as the first argument");
        assert.equal(onSuccessArgs[1], this.form, "onSuccess called with the 'form' as the second argument");
      });

      test('submitting the form is rejected', async function(assert) {
        const submission = this.form.submit();

        this.deferred.reject("error");

        await submission;

        assert.ok(this.onSubmit.calledOnce, "onSubmit was called");
        assert.ok(this.onError.calledOnce, "onError was called");
        assert.notOk(this.onSuccess.called, "onSuccess was never called");

        const onErrorArgs = this.onError.getCall(0).args;
        assert.equal(onErrorArgs.length, 2, "onError called with two arguments");
        assert.equal(onErrorArgs[0], "error", "onError called with the submit error as the first argument");
        assert.equal(onErrorArgs[1], this.form, "onError called with the 'form' as the second argument");
      });
    });

    test('cancel the form', async function(assert) {
      const deferred = defer();
      const onCancel = sinon.stub(this.form, "onCancel").returns(deferred.promise);

      assertFormProps(assert, this.form, { isCancelling: false });

      const cancellation = this.form.cancel();

      assertFormProps(assert, this.form, { isCancelling: true });

      assert.ok(onCancel.calledOnce, "onCancel was called");

      const onCancelArgs = onCancel.getCall(0).args;
      assert.equal(onCancelArgs.length, 1, "onCancel called with one argument");
      assert.equal(onCancelArgs[0], this.form, "onCancel called with the 'form' as the first argument");

      deferred.resolve();
      await cancellation;

      assertFormProps(assert, this.form, { isCancelling: false });
    });

    test('validate the form', async function(assert) {
      const deferred = defer();
      const onValidate = sinon.stub(this.form, "onValidate").returns(deferred.promise);

      assertFormProps(assert, this.form, { isValidating: false });

      const validation = this.form.validate();

      assertFormProps(assert, this.form, { isValidating: true });

      assert.ok(onValidate.calledOnce, "onValidate was called");

      const onValidateArgs = onValidate.getCall(0).args;
      assert.equal(onValidateArgs.length, 1, "onValidate called with one argument");
      assert.equal(onValidateArgs[0], this.form, "onValidate called with the 'form' as the first argument");

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

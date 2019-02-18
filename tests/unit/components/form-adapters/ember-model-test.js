import sinon from 'sinon';
import { module, test } from 'qunit';
import { get } from '@ember/object';
import { run } from '@ember/runloop';
import { setupTest } from 'ember-qunit';

module('Unit | Component | form-adapters/ember-model', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.component = this.owner.factoryFor('component:fit-form').create({ adapter: 'ember-model' });
    this.store = this.owner.lookup("service:store");
  });

  function assertProps(assert, model, assertions = {}) {
    Object.keys(assertions).forEach((k) => {
      const assertionMethod = assertions[k] ? "ok" : "notOk";
      assert[assertionMethod]( get(model, k) );
    });
  }

  module('without models', function(hooks) {
    hooks.beforeEach(function() {
      this.form = this.component.get('formObject');
    });

    test('the default state', function(assert) {
      assert.ok(this.component);
      assert.ok(this.form);

      assertProps(assert, this.form, {
        isDirty: false,      // Dirtiness
        isInvalid: false,    // Validity
        isSubmittable: false // Submittability
      });
    });

    test('submit the form', function(assert) {
      const onSubmit = sinon.spy(this.form, "onSubmit");
      const onSuccess = sinon.spy(this.form, "onSuccess");

      run(() => this.form.submit() );

      assert.ok(onSubmit.calledOnce, "onSubmit was called");
      assert.ok(onSuccess.calledOnce, "onSuccess was called");

      const onSubmitArgs = onSubmit.getCall(0).args;
      assert.equal(onSubmitArgs.length, 1, "onSubmit called with one argument");
      assert.equal(onSubmitArgs[0], this.form, "onSubmit called with the 'form' as the first argument");

      const onSuccessArgs = onSuccess.getCall(0).args;
      assert.equal(onSuccessArgs.length, 2, "onSuccess called with two arguments");
      assert.deepEqual(onSuccessArgs[0], [], "onSubmit called with array of results as the first argument");
      assert.equal(onSuccessArgs[1], this.form, "onSuccess called with the 'form' as the second argument");
    });
  });

  module('with a model', function(hooks) {
    hooks.beforeEach(function() {
      this.post = run(() => this.store.createRecord('post') );
      this.component.set('models', this.post);
      this.form = this.component.get('formObject');
    });

    test('the form states', function(assert) {
      assert.ok(this.component);
      assert.ok(this.form);
      assert.deepEqual(this.form.get('models'), [ this.post ]);

      assertProps(assert, this.post, {
        hasDirtyAttributes: true // Dirtiness
      });

      assertProps(assert, this.form, {
        isDirty: true,      // Dirtiness
        isInvalid: false,   // Validity
        isSubmittable: true // Submittability
      });
    });

    module('submit the form', function(hooks) {
      hooks.beforeEach(function() {
        this.onSuccess = sinon.spy(this.form, "onSuccess");
        this.onError = sinon.spy(this.form, "onError");
      });

      test('submitting the form is fulfilled', async function(assert) {
        const modelSave = sinon.stub(this.post, "save").resolves(42);

        await this.form.submit();

        assert.ok(modelSave.calledOnce, "model.save was called");

        assert.ok(this.onSuccess.calledOnce, "onSuccess was called");
        assert.notOk(this.onError.called, "onError was never called");

        const onSuccessArgs = this.onSuccess.getCall(0).args;
        assert.equal(onSuccessArgs.length, 2, "onSuccess called with two arguments");
        assert.equal(onSuccessArgs[0], 42, "onSuccess called with the save result as the first argument");
        assert.equal(onSuccessArgs[1], this.form, "onSuccess called with the 'form' as the second argument");
      });

      test('submitting the form is rejected', async function(assert) {
        const modelSave = sinon.stub(this.post, "save").rejects("error");

        await this.form.submit();

        assert.ok(modelSave.calledOnce, "model.save was called");

        assert.ok(this.onError.calledOnce, "onError was called");
        assert.notOk(this.onSuccess.called, "onSuccess was never called");

        const onErrorArgs = this.onError.getCall(0).args;
        assert.equal(onErrorArgs.length, 2, "onError called with two arguments");
        assert.equal(onErrorArgs[0], "error", "onError called with the save error as the first argument");
        assert.equal(onErrorArgs[1], this.form, "onError called with the 'form' as the second argument");
      });
    });

    test('cancel the form', function(assert) {
      const modelRollback = sinon.spy(this.post, "rollbackAttributes");

      run(() => this.form.cancel() );

      assert.ok(modelRollback.calledOnce, "model.rollbackAttributes was called");
    });

    test('validate the form', function(assert) {
      run(() => this.form.validate() );

      assert.ok(this.component, "calling validate does not fail");
    });
  });
});

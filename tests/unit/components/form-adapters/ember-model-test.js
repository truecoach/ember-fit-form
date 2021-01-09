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
      this.form = this.component.formObject;
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
      const onsubmit = sinon.spy(this.form, "onsubmit");
      const onsuccess = sinon.spy(this.form, "onsuccess");

      run(() => this.form.submit() );

      assert.ok(onsubmit.calledOnce, "onsubmit was called");
      assert.ok(onsuccess.calledOnce, "onsuccess was called");

      const onsubmitArgs = onsubmit.getCall(0).args;
      assert.equal(onsubmitArgs.length, 1, "onsubmit called with one argument");
      assert.equal(onsubmitArgs[0], this.form, "onsubmit called with the 'form' as the first argument");

      const onsuccessArgs = onsuccess.getCall(0).args;
      assert.equal(onsuccessArgs.length, 2, "onsuccess called with two arguments");
      assert.deepEqual(onsuccessArgs[0], [], "onsubmit called with array of results as the first argument");
      assert.equal(onsuccessArgs[1], this.form, "onsuccess called with the 'form' as the second argument");
    });
  });

  module('with a model', function(hooks) {
    hooks.beforeEach(function() {
      this.post = run(() => this.store.createRecord('post') );
      this.component.set('models', this.post);
      this.form = this.component.formObject;
    });

    test('the form states', function(assert) {
      assert.ok(this.component);
      assert.ok(this.form);
      assert.deepEqual(this.form.models, [ this.post ]);

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
        this.onsuccess = sinon.spy(this.form, "onsuccess");
        this.onerror = sinon.spy(this.form, "onerror");
      });

      test('submitting the form is fulfilled', async function(assert) {
        const modelSave = sinon.stub(this.post, "save").resolves(42);

        await this.form.submit();

        assert.ok(modelSave.calledOnce, "model.save was called");

        assert.ok(this.onsuccess.calledOnce, "onsuccess was called");
        assert.notOk(this.onerror.called, "onerror was never called");

        const onsuccessArgs = this.onsuccess.getCall(0).args;
        assert.equal(onsuccessArgs.length, 2, "onsuccess called with two arguments");
        assert.equal(onsuccessArgs[0], 42, "onsuccess called with the save result as the first argument");
        assert.equal(onsuccessArgs[1], this.form, "onsuccess called with the 'form' as the second argument");
      });

      test('submitting the form is rejected', async function(assert) {
        const modelSave = sinon.stub(this.post, "save").rejects("error");

        await this.form.submit();

        assert.ok(modelSave.calledOnce, "model.save was called");

        assert.ok(this.onerror.calledOnce, "onerror was called");
        assert.notOk(this.onsuccess.called, "onsuccess was never called");

        const onerrorArgs = this.onerror.getCall(0).args;
        assert.equal(onerrorArgs.length, 2, "onerror called with two arguments");
        assert.equal(onerrorArgs[0], "error", "onerror called with the save error as the first argument");
        assert.equal(onerrorArgs[1], this.form, "onerror called with the 'form' as the second argument");
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

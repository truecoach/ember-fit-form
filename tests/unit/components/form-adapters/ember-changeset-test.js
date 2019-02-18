import Changeset from 'ember-changeset';
import sinon from 'sinon';
import { module, test } from 'qunit';
import { get } from '@ember/object';
import { run } from '@ember/runloop';
import { setupTest } from 'ember-qunit';

module('Unit | Component | form-adapters/ember-changeset', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.component = this.owner.factoryFor('component:fit-form').create({ adapter: 'ember-changeset' });
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

      assertFormProps(assert, this.form, {
        isDirty: false,      // Dirtiness
        isInvalid: false,    // Validity
        isSubmittable: false // Submittability
      });
    });

    test('submit the form', async function(assert) {
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
      this.post = new Changeset({});
      this.component.set('models', this.post);
      this.form = this.component.get('formObject');
    });

    test('the form states', function(assert) {
      assert.ok(this.component);
      assert.ok(this.form);
      assert.deepEqual(this.form.get('models'), [ this.post ]);

      assertFormProps(assert, this.post, {
        isDirty: false,      // Dirtiness
        isInvalid: false     // Validity
      });

      assertFormProps(assert, this.form, {
        isDirty: false,      // Dirtiness
        isInvalid: false,    // Validity
        isSubmittable: false // Submittability
      });

      this.post.set('title', 'my post');

      assertFormProps(assert, this.post, {
        isDirty: true,      // Dirtiness
        isInvalid: false     // Validity
      });

      assertFormProps(assert, this.form, {
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
        const changesetSave = sinon.stub(this.post, "save").resolves(42);

        await this.form.submit();

        assert.ok(changesetSave.calledOnce, "changeset.save was called");

        assert.ok(this.onsuccess.calledOnce, "onsuccess was called");
        assert.notOk(this.onerror.called, "onerror was never called");

        const onsuccessArgs = this.onsuccess.getCall(0).args;
        assert.equal(onsuccessArgs.length, 2, "onsuccess called with two arguments");
        assert.equal(onsuccessArgs[0], 42, "onsuccess called with the save result as the first argument");
        assert.equal(onsuccessArgs[1], this.form, "onsuccess called with the 'form' as the second argument");
      });

      test('submitting the form is rejected', async function(assert) {
        const changesetSave = sinon.stub(this.post, "save").rejects("error");

        await this.form.submit();

        assert.ok(changesetSave.calledOnce, "changeset.save was called");

        assert.ok(this.onerror.calledOnce, "onerror was called");
        assert.notOk(this.onsuccess.called, "onsuccess was never called");

        const onerrorArgs = this.onerror.getCall(0).args;
        assert.equal(onerrorArgs.length, 2, "onerror called with two arguments");
        assert.equal(onerrorArgs[0], "error", "onerror called with the save error as the first argument");
        assert.equal(onerrorArgs[1], this.form, "onerror called with the 'form' as the second argument");
      });
    });

    test('cancel the form', function(assert) {
      const changesetRollback = sinon.spy(this.post, "rollback");

      run(() => this.form.cancel() );

      assert.ok(changesetRollback.calledOnce, "chagneset.rollback was called");
    });

    test('validate the form', function(assert) {
      const changesetValidate = sinon.spy(this.post, "validate");

      run(() => this.form.validate() );

      assert.ok(changesetValidate.calledOnce, "chagneset.validate was called");
    });
  });
});

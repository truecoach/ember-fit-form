import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import sinon from 'sinon';
import { module, test } from 'qunit';
import { get } from '@ember/object';
import { setupTest } from 'ember-qunit';
import { validatePresence } from 'ember-changeset-validations/validators';

module('Unit | Component | form-adapters/ember-changeset/ember-changeset-validations', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.component = this.owner.factoryFor('component:fit-form').create({ adapter: 'ember-changeset' });
  });

  function assertFormProps(assert, form, assertions = {}) {
    Object.keys(assertions).forEach((k) => {
      assert.equal(get(form, k), assertions[k]);
    });
  }

  module('with a model with validations', function(hooks) {
    hooks.beforeEach(function() {
      const postValidations = { title: validatePresence({ presence: true }) };
      this.post = new Changeset({}, lookupValidator(postValidations), postValidations);
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

      this.post.validate();

      assertFormProps(assert, this.post, {
        isDirty: false,      // Dirtiness
        isInvalid: true     // Validity
      });

      assertFormProps(assert, this.form, {
        isDirty: false,      // Dirtiness
        isInvalid: true,     // Validity
        isSubmittable: false // Submittability
      });
    });

    module('submit the form', function(hooks) {
      hooks.beforeEach(function() {
        this.onValidate = sinon.spy(this.form, "onValidate");
        this.onSubmit = sinon.spy(this.form, "onSubmit");
        this.onSuccess = sinon.spy(this.form, "onSuccess");
        this.onError = sinon.spy(this.form, "onError");
      });

      test('submitting an invalid form fails the validation step', async function(assert) {
        const changesetSave = sinon.spy(this.post, "save");

        assert.ok(this.form.get('isValid'), "the form is valid prior to submission");

        const submission = this.form.submit();

        assert.ok(this.onValidate.calledOnce, "onValidate was called");
        assert.ok(this.form.get('isInvalid'), "the form is invalid after validation");
        assert.ok(submission.isError, "the submission was rejected");

        assert.notOk(this.onSubmit.called, "onSubmit was never called");
        assert.notOk(changesetSave.called, "changeset.save was never called");
        assert.notOk(this.onSuccess.called, "onSuccess was never called");
        assert.notOk(this.onError.called, "onError was never called");
      });

      test('submitting the form is fulfilled', async function(assert) {
        const changesetSave = sinon.stub(this.post, "save").resolves(42);

        this.post.set('title', 'my post');

        assert.ok(this.form.get('isValid'), "the form is valid prior to submission");

        const submission = this.form.submit();

        assert.ok(this.onValidate.calledOnce, "onValidate was called");
        assert.ok(this.form.get('isValid'), "the form is valid after validation");
        assert.notOk(submission.isError, "the submission passed validation");

        await submission;

        assert.ok(changesetSave.calledOnce, "changeset.save was called");

        assert.ok(this.onSuccess.calledOnce, "onSuccess was called");
        assert.notOk(this.onError.called, "onError was never called");

        const onSuccessArgs = this.onSuccess.getCall(0).args;
        assert.equal(onSuccessArgs.length, 2, "onSuccess called with two arguments");
        assert.equal(onSuccessArgs[0], 42, "onSuccess called with the save result as the first argument");
        assert.equal(onSuccessArgs[1], this.form, "onSuccess called with the 'form' as the second argument");
      });

      test('submitting the form is rejected', async function(assert) {
        const changesetSave = sinon.stub(this.post, "save").rejects("error");

        this.post.set('title', 'my post');

        assert.ok(this.form.get('isValid'), "the form is valid prior to submission");

        const submission = this.form.submit();

        assert.ok(this.onValidate.calledOnce, "onValidate was called");
        assert.ok(this.form.get('isValid'), "the form is valid after validation");
        assert.notOk(submission.isError, "the submission passed validation");

        await submission;

        assert.ok(changesetSave.calledOnce, "changeset.save was called");

        assert.ok(this.onError.calledOnce, "onError was called");
        assert.notOk(this.onSuccess.called, "onSuccess was never called");

        const onErrorArgs = this.onError.getCall(0).args;
        assert.equal(onErrorArgs.length, 2, "onError called with two arguments");
        assert.equal(onErrorArgs[0], "error", "onError called with the save error as the first argument");
        assert.equal(onErrorArgs[1], this.form, "onError called with the 'form' as the second argument");
      });
    });

    test('cancel the form', function(assert) {
      const changesetRollback = sinon.spy(this.post, "rollback");

      this.form.cancel();

      assert.ok(changesetRollback.calledOnce, "chagneset.rollback was called");
    });

    test('validate the form', function(assert) {
      const changesetValidate = sinon.spy(this.post, "validate");

      this.form.validate();

      assert.ok(changesetValidate.calledOnce, "chagneset.validate was called");
    });
  });
});

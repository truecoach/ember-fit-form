import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import sinon from 'sinon';
import { module, test } from 'qunit';
import { get } from '@ember/object';
import { run } from '@ember/runloop';
import { setupTest } from 'ember-qunit';
import { validatePresence } from 'ember-changeset-validations/validators';

module('Unit | Component | form-adapters/ember-changeset/ember-changeset-validations', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.component = this.owner.factoryFor('component:fit-form').create({ adapter: 'ember-changeset' });
  });

  function assertFormProps(assert, form, assertions = {}) {
    Object.keys(assertions).forEach((k) => {
      assert.equal(get(form, k), assertions[k],`form: ${k} is ${assertions[k]}`);
    });
  }

  module('with a model with validations', function(hooks) {
    hooks.beforeEach(function() {
      const postValidations = { title: validatePresence({ presence: true }) };
      this.post = new Changeset({}, lookupValidator(postValidations), postValidations);
      this.component.set('models', this.post);
      this.form = this.component.formObject;
    });

    test('the form states', function(assert) {
      assert.ok(this.component);
      assert.ok(this.form);
      assert.deepEqual(this.form.models, [ this.post ]);

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
        this.oninvalid = sinon.spy(this.form, "oninvalid");
        this.onvalidate = sinon.spy(this.form, "onvalidate");
        this.onsubmit = sinon.spy(this.form, "onsubmit");
        this.onsuccess = sinon.spy(this.form, "onsuccess");
        this.onerror = sinon.spy(this.form, "onerror");
      });

      test('submitting an invalid form fails the validation step', async function(assert) {
        const changesetSave = sinon.spy(this.post, "save");

        assert.ok(this.form.isValid, "the form is valid prior to submission");

        await run(() => this.form.submit());

        assert.ok(this.onvalidate.calledOnce, "onvalidate was called");
        assert.ok(this.oninvalid.calledOnce, "oninvalid was called");
        assert.ok(this.form.isInvalid, "the form is invalid after validation");

        assert.notOk(this.onsubmit.called, "onsubmit was never called");
        assert.notOk(changesetSave.called, "changeset.save was never called");
        assert.notOk(this.onsuccess.called, "onsuccess was never called");
        assert.notOk(this.onerror.called, "onerror was never called");
      });

      test('submitting the form is fulfilled', async function(assert) {
        const changesetSave = sinon.stub(this.post, "save").resolves(42);

        this.post.set('title', 'my post');

        assert.ok(this.form.isValid, "the form is valid prior to submission");

        const submission = this.form.submit();

        assert.ok(this.onvalidate.calledOnce, "onvalidate was called");
        assert.ok(this.form.isValid, "the form is valid after validation");
        assert.notOk(submission.isError, "the submission passed validation");

        await submission;

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

        this.post.set('title', 'my post');

        assert.ok(this.form.isValid, "the form is valid prior to submission");

        const submission = this.form.submit();

        assert.ok(this.onvalidate.calledOnce, "onvalidate was called");
        assert.ok(this.form.isValid, "the form is valid after validation");
        assert.notOk(submission.isError, "the submission passed validation");

        await submission;

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

    module('validate the form', function(hooks) {
      hooks.beforeEach(function() {
        this.onvalidate = sinon.spy(this.form, "onvalidate");
        this.oninvalid = sinon.spy(this.form, "oninvalid");
      });

      test('validating an invalid form fails the validation step', async function(assert) {
        const changesetValidate = sinon.spy(this.post, "validate");

        assert.ok(this.form.isValid, "the form is valid prior to validation");
        await run(() => this.form.validate());

        assert.ok(this.onvalidate.calledOnce, "onvalidate was called");
        assert.ok(changesetValidate.called, "changeset.validate was never called");
        assert.ok(this.oninvalid.calledOnce, "oninvalid was called");

        assert.ok(this.form.isInvalid, "the form is invalid after validation");
      });

      test('validating the form is fulfilled', async function(assert) {
        const changesetValidate = sinon.stub(this.post, "validate").resolves(42);

        this.post.set('title', 'my post');

        assert.ok(this.form.isValid, "the form is valid prior to validation");

        await this.form.validate();

        assert.ok(changesetValidate.calledOnce, "changeset.validate was called");
        assert.ok(this.onvalidate.calledOnce, "onvalidate was called");
        assert.notOk(this.oninvalid.called, "oninvalid was never called");
        assert.ok(this.form.isValid, "the form is valid after validation");
      });

      test('validating the form is rejected', async function(assert) {
        const changesetValidate = sinon.stub(this.post, "validate").rejects("error");

        this.post.set('title', 'my post');

        assert.ok(this.form.isValid, "the form is valid prior to validation");

        await this.form.validate();

        assert.ok(changesetValidate.calledOnce, "changeset.validate was called");
        assert.ok(this.onvalidate.calledOnce, "onvalidate was called");
        assert.ok(this.oninvalid.called, "oninvalid was called");
        assert.ok(this.form.isValid, "the form is valid after validation");

        const oninvalidArgs = this.oninvalid.getCall(0).args;
        assert.equal(oninvalidArgs.length, 2, "oninvalid called with two arguments");
        assert.equal(oninvalidArgs[0], "error", "oninvalid called with the validate error as the first argument");
        assert.equal(oninvalidArgs[1], this.form, "oninvalid called with the 'form' as the second argument");
      });
    });
  });
});

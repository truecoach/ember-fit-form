import Changeset from 'ember-changeset';
import RSVP from 'rsvp';
import lookupValidator from 'ember-changeset-validations';
import test from 'ember-sinon-qunit/test-support/test';
import { get } from '@ember/object';
import { module } from 'qunit';
import { run } from '@ember/runloop';
import { setupTest } from 'ember-qunit';
import { validatePresence } from 'ember-changeset-validations/validators';

function assertFormProps(assert, form, assertions = {}) {
  Object.keys(assertions).forEach((k) => {
    assert.equal(get(form, k), assertions[k]);
  });
}

module('Unit | Component | fit-form', function(hooks) {
  setupTest(hooks);

  test('an empty form', function(assert) {
    const component = this.owner.factoryFor('component:fit-form').create();
    const form = component.get('formObject');

    assert.deepEqual(form.models, []);

    assertFormProps(assert, form, {
      // Submittability
      isUnsubmittable: true,
      isSubmitting: false,
      isSubmittable: false,

      // Validity
      isValid: true,
      isInvalid: false,

      // Dirtiness
      isPristine: true,
      isDirty: false
    });
  });

  test('the form monitors changesets for dirtiness and submittability', function(assert) {
    const changeset = new Changeset({});

    let component = this.owner.factoryFor('component:fit-form').create({ models: changeset });

    let form = component.get('formObject');

    assert.deepEqual(form.models, [ changeset ]);

    assertFormProps(assert, form, {
      // Submittability
      isUnsubmittable: true,
      isSubmittable: false,

      // Dirtiness
      isPristine: true,
      isDirty: false
    });

    changeset.set('name', 'Fit Form');

    form = component.get('formObject');
    assertFormProps(assert, form, {
      // Submittability
      isUnsubmittable: false,
      isSubmittable: true,

      // Dirtiness
      isPristine: false,
      isDirty: true
    });
  });

  test('the form monitors many changesets for dirtiness and submittability', function(assert) {
    const changesets = [ new Changeset({}), new Changeset({}) ];

    let component = this.owner.factoryFor('component:fit-form').create({ models: changesets });

    let form = component.get('formObject');

    assert.deepEqual(form.models, changesets);

    assertFormProps(assert, form, {
      // Submittability
      isUnsubmittable: true,
      isSubmittable: false,

      // Dirtiness
      isPristine: true,
      isDirty: false
    });

    changesets[0].set('name', 'Model0');

    assertFormProps(assert, form, {
      // Submittability
      isUnsubmittable: false,
      isSubmittable: true,

      // Dirtiness
      isPristine: false,
      isDirty: true
    });

    changesets[1].set('name', 'Model1');

    form = component.get('formObject');
    assertFormProps(assert, form, {
      // Submittability
      isUnsubmittable: false,
      isSubmittable: true,

      // Dirtiness
      isPristine: false,
      isDirty: true
    });
  });

  test('the form monitors changesets with validations', function(assert) {
    assert.expect(9);

    const validations = { name: validatePresence({ presence: true }) };
    const changeset = new Changeset({}, lookupValidator(validations), validations);

    changeset.validate();

    let component = this.owner.factoryFor('component:fit-form').create({ models: changeset });
    let form = component.get('formObject');

    assert.deepEqual(form.models, [ changeset ]);

    assertFormProps(assert, form, {
      // Submittability
      isUnsubmittable: true,
      isSubmittable: false,

      // Validity
      isInvalid: true,
      isValid: false
    });

    changeset.set('name', 'Fit Form');

    form = component.get('formObject');
    assertFormProps(assert, form, {
      // Submittability
      isUnsubmittable: false,
      isSubmittable: true,

      // Validity
      isInvalid: false,
      isValid: true
    });
  });

  test('the form monitors many changesets with validations', function(assert) {
    assert.expect(13);

    const validations = { name: validatePresence({ presence: true }) };
    const changesets = [
      new Changeset({}, lookupValidator(validations), validations),
      new Changeset({}, lookupValidator(validations), validations),
    ];

    changesets.forEach((c) => c.validate());

    let component = this.owner.factoryFor('component:fit-form').create({ models: changesets });
    let form = component.get('formObject');

    assert.deepEqual(form.models, changesets);

    assertFormProps(assert, form, {
      // Submittability
      isUnsubmittable: true,
      isSubmittable: false,

      // Validity
      isInvalid: true,
      isValid: false
    });

    changesets[0].set('name', 'Model0');

    assertFormProps(assert, form, {
      // Submittability
      isUnsubmittable: true,
      isSubmittable: false,

      // Validity
      isInvalid: true,
      isValid: false
    });

    changesets[1].set('name', 'Model1');

    form = component.get('formObject');
    assertFormProps(assert, form, {
      // Submittability
      isUnsubmittable: false,
      isSubmittable: true,

      // Validity
      isInvalid: false,
      isValid: true
    });
  });

  test('submitting a valid form', async function(assert) {
    assert.expect(4);

    const deferred =  RSVP.defer();

    const component = this.owner.factoryFor('component:fit-form').create();
    const submitStub = this.stub(component, 'onSubmit').returns(deferred.promise);

    let form = component.get('formObject');

    const submission = run(() => form.submit());

    assert.ok(form.get('isSubmitting'), 'isSubmitting is true when the submission is pending');

    assert.ok(submitStub.calledOnce, "onSubmit was called");

    const [ arg ] = submitStub.getCall(0).args;

    assert.equal(arg, form, 'onSubmit passes fitForm as the first argument');

    deferred.resolve();

    await submission;

    assert.notOk(form.get('isSubmitting'), 'isSubmitting is false when the submission is settled');
  });

  test('cancelling a form', function(assert) {
    assert.expect(2);

    const component = this.owner.factoryFor('component:fit-form').create();
    const cancelSpy = this.spy(component, 'onCancel');
    let form = component.get('formObject');

    run(() => form.cancel());

    assert.ok(cancelSpy.calledOnce, "onCancel was called");

    [ form ] = cancelSpy.getCall(0).args;

    assert.ok(form, 'onCancel passes publicAPI as the first argument');
  });

  test('the submission succeeds', async function(assert) {
    assert.expect(3);

    const component = this.owner.factoryFor('component:fit-form').create();
    const successSpy = this.spy(component, 'onSuccess');

    this.stub(component, 'onSubmit').returns('submission success');

    let success, form = component.get('formObject');

    await run(() => form.submit());

    assert.ok(successSpy.calledOnce, "onSuccess was called");

    [ success, form ] = successSpy.getCall(0).args;

    assert.ok(form, 'onSuccess passes publicAPI');
    assert.equal(success, 'submission success', 'onSuccess passes the submit return value');
  });

  test('the submission returns a resolved promise', async function(assert) {
    assert.expect(3);

    const component = this.owner.factoryFor('component:fit-form').create();
    const successSpy = this.spy(component, 'onSuccess');

    this.stub(component, 'onSubmit').resolves('submission success');

    let success, form = component.get('formObject');

    await run(() => form.submit());

    assert.ok(successSpy.calledOnce, "onSuccess was called");

    [ success, form ] = successSpy.getCall(0).args;

    assert.ok(form, 'onSuccess passes publicAPI');
    assert.equal(success, 'submission success', 'onSuccess passes the submit promise resolution');
  });

  test('the submission returns a rejected promise', async function(assert) {
    assert.expect(3);

    const component = this.owner.factoryFor('component:fit-form').create();
    const errorSpy = this.spy(component, 'onError');

    this.stub(component, 'onSubmit').rejects('the horror of all horrors');

    let error, form = component.get('formObject');

    await run(() => form.submit());

    assert.ok(errorSpy.calledOnce, "onError was called");

    [ error, form ] = errorSpy.getCall(0).args;

    assert.ok(form, 'onError passes publicAPI');
    assert.equal(error, 'the horror of all horrors', 'onError passes the submit promise rejection');
  });

  test('submitting a valid form with changesets', function(assert) {
    assert.expect(1);

    const changeset = new Changeset({});
    const validateStub = this.stub(changeset, 'validate');

    let component = this.owner.factoryFor('component:fit-form').create({ models: changeset });
    let form = component.get('formObject');

    run(() => form.submit());

    assert.ok(validateStub.calledOnce, 'calls "validate" on each changeset');
  });

  test('canceling a form with changesets', function(assert) {
    assert.expect(1);

    const changeset = new Changeset({});
    const rollbackStub = this.stub(changeset, 'rollback');

    let component = this.owner.factoryFor('component:fit-form').create({ models: changeset });
    let form = component.get('formObject');

    run(() => form.cancel());

    assert.ok(rollbackStub.calledOnce, 'calls "rollback" on each changeset');
  });
});

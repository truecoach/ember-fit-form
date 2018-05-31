import { module } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import test from 'ember-sinon-qunit/test-support/test';

import Changeset from 'ember-changeset';

import { click } from '@ember/test-helpers';
import { find } from 'ember-native-dom-helpers';

import RSVP from 'rsvp';
import { run } from '@ember/runloop';

module('Integration | Component | fit-form', function(hooks) {
  setupRenderingTest(hooks);

  test('rendering a fit-form', async function(assert) {
    assert.expect(2);

    await render(hbs`
    {{#fit-form}}
      template block text
    {{/fit-form}}
  `);

    assert.ok(find('form'), 'renders as a `form` element');
    assert.equal(find('form').textContent.trim(), 'template block text');
  });

  test('Submitting a form', async function(assert) {
    assert.expect(6);

    const changeset = new Changeset({});

    this.setProperties({
      changeset,
      onSubmit() {
        return RSVP.defer().promise;
      } // pending promise
    });

    const submitSpy = this.spy(this, 'onSubmit');
    const validateSpy = this.spy(changeset, 'validate');

    await render(hbs`
    {{#fit-form changeset onSubmit=onSubmit as |form|}}
      <button {{action "submit" target=form}} disabled={{form.isUnsubmittable}}>
        Save
      </button>
    {{/fit-form}}
  `);

    assert.ok(find('button').disabled, 'the form is unsubmittable');

    run(() => { changeset.set('name', 'Fit Form'); });

    assert.notOk(find('button').disabled, 'the form is submittable');

    await click('button');

    assert.ok(submitSpy.calledOnce, "onSubmit was called");
    assert.ok(validateSpy.calledOnce, "the changeset was validated");

    const [ component ] = submitSpy.getCall(0).args;

    assert.ok(component, 'onSubmit is called with the publicAPI as the first arg');

    assert.ok(find('button').disabled, 'the form is unsubmittable while submitting');
  });

  test('Submitting a form succeeds', async function(assert) {
    const done = assert.async();
    assert.expect(3);

    const changeset = new Changeset({});

    this.setProperties({
      changeset,
      onSuccess()  { done(); },
      onSubmit()   { return RSVP.resolve('Total Success'); }
    });

    const successSpy = this.spy(this, 'onSuccess');

    await render(hbs`
    {{#fit-form changeset onSubmit=onSubmit onSuccess=onSuccess as |form|}}
      <button class="submit" {{action "submit" target=form}}>
        Save
      </button>
    {{/fit-form}}
  `);

    await click('.submit');

    assert.ok(successSpy.calledOnce, "onSuccess was called");

    const [ component, result ] = successSpy.getCall(0).args;

    assert.ok(component, 'onSuccess is called with the publicAPI as the first arg');
    assert.equal(result, 'Total Success', 'onSuccess is called with the onSubmit resolution as the second arg');
  });

  test('Submitting a form fails', async function(assert) {
    const done = assert.async();
    assert.expect(3);

    const changeset = new Changeset({});
    this.setProperties({
      changeset,
      onError()  { done(); },
      onSubmit() { return RSVP.reject('Sorry not sorry'); }
    });

    const errorSpy = this.spy(this, 'onError');

    await render(hbs`
    {{#fit-form changeset onSubmit=onSubmit onError=onError as |form|}}
      <button class="submit" {{action "submit" target=form}}>
        Save
      </button>
    {{/fit-form}}
  `);

    await click('.submit');

    assert.ok(errorSpy.calledOnce, 'onError was called');

    const [ component, error ] = errorSpy.getCall(0).args;

    assert.ok(component, 'onError is called with the publicAPI as the first arg');
    assert.equal(error, 'Sorry not sorry', 'onError is called with the onSubmit rejection as the second arg');
  });

  test('Cancelling a form', async function(assert) {
    assert.expect(3);

    const changeset = new Changeset({});

    this.setProperties({
      changeset,
      onCancel()  {}
    });

    const cancelSpy = this.spy(this, 'onCancel');
    const rollbackSpy = this.spy(changeset, 'rollback');

    await render(hbs`
    {{#fit-form changeset onCancel=onCancel as |form|}}
      <a {{action "cancel" target=form}}>Cancel</a>
    {{/fit-form}}
  `);

    await click('a');

    assert.ok(cancelSpy.calledOnce, "onCancel was called");
    assert.ok(rollbackSpy.calledOnce, "rollback was called");

    const [ component ] = cancelSpy.getCall(0).args;

    assert.ok(component, 'onCancel is called with the publicAPI as the first arg');
  });

  // TODO: Perform Syntax deserves its own set of tests
  test('performing a task', async function(assert) {
    assert.expect(1);

    const changeset = new Changeset({});

    this.setProperties({
      changeset,
      onCancel()  {}
    });

    const cancelSpy = this.spy(this, 'onCancel');

    await render(hbs`
    {{#fit-form changeset onCancel=onCancel as |form|}}
      <a onclick={{perform form.cancelTask}}>Cancel</a>
    {{/fit-form}}
  `);

    await click('a');

    assert.ok(cancelSpy.calledOnce, "onCancel was called");
  });
});

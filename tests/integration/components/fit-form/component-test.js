import Changeset from 'ember-changeset';
import RSVP from 'rsvp';
import hbs from 'htmlbars-inline-precompile';
import test from 'ember-sinon-qunit/test-support/test';
import { click } from '@ember/test-helpers';
import { module } from 'qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { setupRenderingTest } from 'ember-qunit';

module('Integration | Component | fit-form', function(hooks) {
  setupRenderingTest(hooks);

  test('rendering a fit-form', async function(assert) {
    assert.expect(2);

    await render(hbs`
    {{#fit-form}}
      template block text
    {{/fit-form}}
  `);

    assert.dom('form').exists('renders as a `form` element');
    assert.dom('form').hasText('template block text');
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

    assert.dom('button').isDisabled('the form is unsubmittable');

    run(() => { changeset.set('name', 'Fit Form'); });

    assert.dom('button').isNotDisabled('the form is submittable');

    await click('button');

    assert.ok(submitSpy.calledOnce, "onSubmit was called");
    assert.ok(validateSpy.calledOnce, "the changeset was validated");

    const [ component ] = submitSpy.getCall(0).args;

    assert.ok(component, 'onSubmit is called with the publicAPI as the first arg');

    assert.dom('button').isDisabled('the form is unsubmittable while submitting');
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

    const [ result, component ] = successSpy.getCall(0).args;

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

    const [ error, component ] = errorSpy.getCall(0).args;

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

  test('invoking the action', async function(assert) {
    assert.expect(2);

    const changeset = new Changeset({});

    this.setProperties({
      changeset,
      onCancel(form)  {
        assert.equal(form.get('models.firstObject'), changeset, 'formObject is the "this" context');
      },
      onSubmit(form)  {
        assert.equal(form.get('models.firstObject'), changeset, 'formObject is the "this" context');
      }
    });

    await render(hbs`
    {{#fit-form changeset onSubmit=onSubmit onCancel=onCancel as |form|}}
      <a {{action form.cancel}}>Cancel</a>
      <button {{action form.submit}}>Submit</button>
    {{/fit-form}}
  `);

    await click('a');
    await click('button');
  });

  test('invoking the action with a target', async function(assert) {
    assert.expect(2);

    const changeset = new Changeset({});

    this.setProperties({
      changeset,
      onCancel(form)  {
        assert.equal(form.get('models.firstObject'), changeset, 'formObject is the "this" context');
      },
      onSubmit(form)  {
        assert.equal(form.get('models.firstObject'), changeset, 'formObject is the "this" context');
      }
    });

    await render(hbs`
    {{#fit-form changeset onSubmit=onSubmit onCancel=onCancel as |form|}}
      <a {{action "cancel" target=form}}>Cancel</a>
      <button {{action "submit" target=form}}>Submit</button>
    {{/fit-form}}
  `);

    await click('a');
    await click('button');
  });

  test('invoking the action onclick', async function(assert) {
    assert.expect(2);

    const changeset = new Changeset({});

    this.setProperties({
      changeset,
      onCancel(event, form)  {
        assert.equal(form.get('models.firstObject'), changeset, 'formObject is the "this" context');
      },
      onSubmit(event, form)  {
        assert.equal(form.get('models.firstObject'), changeset, 'formObject is the "this" context');
      }
    });

    await render(hbs`
    {{#fit-form changeset onSubmit=onSubmit onCancel=onCancel as |form|}}
      <a onclick={{action form.cancel}}>Cancel</a>
      <button onclick={{action form.submit}} type="button">Submit</button>
    {{/fit-form}}
  `);

    await click('a');
    await click('button');
  });

  test('invoking the button of type=submit', async function(assert) {
    assert.expect(1);

    const changeset = new Changeset({});

    this.setProperties({
      changeset,
      onSubmit(event, form)  {
        assert.equal(form.get('models.firstObject'), changeset, 'formObject is the "this" context');
      }
    });

    await render(hbs`
      {{#fit-form changeset onSubmit=onSubmit as |form|}}
        <button type="submit">Submit</button>
      {{/fit-form}}
    `);

    await click('button');
  });

  test('performing the action onclick', async function(assert) {
    assert.expect(2);

    const changeset = new Changeset({});

    this.setProperties({
      changeset,
      onCancel(event, form)  {
        assert.equal(form.get('models.firstObject'), changeset, 'formObject is the "this" context');
      },
      onSubmit(event, form)  {
        assert.equal(form.get('models.firstObject'), changeset, 'formObject is the "this" context');
      }
    });

    await render(hbs`
    {{#fit-form changeset onSubmit=onSubmit onCancel=onCancel as |form|}}
      <a onclick={{perform form.cancelTask}}>Cancel</a>
      <button onclick={{perform form.submitTask}} type="button">Cancel</button>
    {{/fit-form}}
  `);

    await click('a');
    await click('button');
  });
});

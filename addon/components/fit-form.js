import Component from '@ember/component';
import layout from '../components/fit-form';
import { getOwner } from '@ember/application';
import { A } from '@ember/array';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default class FitFormComponent extends Component {
  @service fitForm;

  layout = layout;
  tagName = '';

  // ---------------------- Component Hooks ----------------------
  /**
   * @method onsubmit - Handler for the form's submit behavior. `onsubmit` will be called when
   * the form is submitted with a valid model.
   * @param FitForm - public interface for the `fit-form` component
   */
  onsubmit = undefined;

  /**
   * @method onsuccess - Handler for when `onsubmit` succeeds, called when
   * `onsubmit` returns anything other than a rejected Promise
   * @param result - result returned from `onsubmit`
   * @param form - public interface for the `fit-form` component
   */
  onsuccess = undefined;

  /**
   * @method onerror - Handler for errors resulting from the `onsubmit` action, called when
   * `onsubmit` returns a rejected Promise
   * @param error - error returned from rejected `onsubmit` promise
   * @param form - public interface for the `fit-form` component
   */
  onerror = undefined;

  /**
   * @method oncancel - Handler for the form's cancel behavior. `oncancel` will be called when
   * the form is cancelled
   * @param form - public interface for the `fit-form` component
   */
  oncancel = undefined;

  onvalidate = undefined;
  oninvalid = undefined;
  onkeyup = undefined;
  onkeydown = undefined;
  onkeypress = undefined;

  @action
  handleSubmit(event) {
    event.preventDefault();
    this.formObject.submit(...arguments);
  }

  @action
  handleKeyup() {
    if (typeof this.onkeyup === 'function') {
      this.onkeyup(...arguments, this.formObject);
    }
  }

  @action
  handleKeydown() {
    if (typeof this.onkeydown === 'function') {
      this.onkeydown(...arguments, this.formObject);
    }
  }

  @action
  handleKeypress() {
    if (typeof this.onkeypress === 'function') {
      this.onkeypress(...arguments, this.formObject);
    }
  }

  @computed(
    'adapter',
    'models.[]',
    'oncancel',
    'onerror',
    'oninvalid',
    'onsubmit',
    'onsuccess',
    'onvalidate'
  )
  get formObject() {
    let _adapter =
      this.adapter ||
      getOwner(this).resolveRegistration('config:environment')['ember-fit-form']
        .adapter;
    const Adapter = this.fitForm.lookupAdapter(_adapter);
    const models = A([].concat(this.models).flat().filter(Boolean));

    return new Adapter({
      models,
      oncancel: this.oncancel,
      onerror: this.onerror,
      oninvalid: this.oninvalid,
      onsubmit: this.onsubmit,
      onsuccess: this.onsuccess,
      onvalidate: this.onvalidate,
    });
  }
}

import Service from '@ember/service';
import { assert } from '@ember/debug';
import { set, get } from '@ember/object';

import { dasherize } from '@ember/string';
import { getOwner } from '@ember/application';

export default Service.extend({
  /**
   * Cached adapters to reduce multiple expensive lookups.
   *
   * @property _adapters
   * @private
   * @type Object
   * @default null
   */
  _Adapters: null,

  /**
   * When the Service is created, activate adapters that were specified in the
   * configuration. This config is injected into the Service as
   * `options`.
   *
   * @method init
   * @param {Void}
   * @return {Void}
   */
  init() {
    const owner = getOwner(this);
    owner.registerOptionsForType('ember-fit-form@form-adapter', { instantiate: false });
    owner.registerOptionsForType('form-adapter', { instantiate: false });

    set(this, '_Adapters', {});

    this._super(...arguments);
  },

  /**
   * Looks up the adapter from the container. Prioritizes the consuming app's
   * adapters over the addon's adapters.
   *
   * @method lookupAdapter
   * @param {String} name
   * @private
   * @return {Adapter} a local adapter or an adapter from the addon
   */
  lookupAdapter(name) {
    assert('[fit-form] Could not find form adapter without a name.', name);

    const cachedAdapters = this._Adapters;
    const cachedAdapter = get(cachedAdapters, name);

    if (cachedAdapter) { return cachedAdapter; }

    const dasherizedAdapterName = dasherize(name);
    const availableAdapter = getOwner(this).lookup(`ember-fit-form@form-adapter:${dasherizedAdapterName}`);
    const localAdapter = getOwner(this).lookup(`form-adapter:${dasherizedAdapterName}`);
    const adapter = localAdapter ? localAdapter : availableAdapter;

    assert(`[fit-form] Could not find a form adapter named ${name}`, adapter);

    set(cachedAdapters, name, adapter);

    return adapter;
  }
});

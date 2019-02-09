import config from '../config/environment';

export function initialize() {
  const application = arguments[1] || arguments[0];
  const { emberFitForm = {} } = config;
  const { adapter = 'ember-changeset' } = emberFitForm;

  application.register('config:fit-form-adapter', adapter, { instantiate: false });
  application.inject('component:fit-form', 'adapter', 'config:fit-form-adapter');
}

export default {
  name: 'fit-form',
  initialize
};

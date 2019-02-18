import Base from './base';
import { all } from 'rsvp';
import { computed, get } from '@ember/object';

const EmbderModelAdapter = Base.extend({
  _validations: computed.mapBy('models', 'validations'),

  isDirty: computed('models.@each.hasDirtyAttributes', function() {
    return this.get('models').some(c => c.get('hasDirtyAttributes'));
  }),

  isInvalid: computed('_validations.@each.isInvalid', function() {
    const validations = this.get('_validations');
    return validations.some(v => get(v || {}, 'isInvalid'));
  }),

  oncancel(){
    const form = arguments[arguments.length - 1];
    const models = form.get('models');
    models.forEach(m => m.rollbackAttributes());
  },

  onsubmit(){
    const form = arguments[arguments.length - 1];
    const models = form.get('models');
    const submitting = models.map(m => m.save());
    return all(submitting);
  },

  onvalidate(){
    const form = arguments[arguments.length - 1];
    const models = form.get('models');
    const validating = models
          .filter(m => typeof m.validate === "function")
          .map(m => m.validate());

    return all(validating);
  }
});

export default EmbderModelAdapter;

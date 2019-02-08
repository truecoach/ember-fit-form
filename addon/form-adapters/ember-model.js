import Base from './base';
import { computed } from '@ember/object';

const EmbderModelAdapter = Base.extend({
  isDirty: computed('models.@each.hasDirtyAttributes', function() {
    return this.get('models').some(c => c.get('hasDirtyAttributes'));
  }),

  isInvalid: computed('models.@each.validations.isInvalid', function() {
    return this.get('models').some(m => m.get('validations.isInvalid'));
  })
});

export default EmbderModelAdapter;

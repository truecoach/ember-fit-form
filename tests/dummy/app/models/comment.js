import Model, { attr, belongsTo } from '@ember-data/model';

export default class CommentModel extends Model {
  user = belongsTo();
  body = attr();
}

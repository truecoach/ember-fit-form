import Model, { attr, hasMany } from '@ember-data/model';

export default class PostModel extends Model {
  comments = hasMany();

  title = attr();
  body = attr();
}

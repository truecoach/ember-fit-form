'use strict';

module.exports = {
  description: 'Generates a fit-form adapter',

  locals: function() {
    var importStatement = "import BaseAdapter from 'ember-fit-form/form-adapters/base';";
    var baseClass = 'BaseAdapter';

    return {
      importStatement: importStatement,
      baseClass: baseClass
    };
  }
};

# Usage

``` hbs
{{#fit-form model as |form|}}

  <button {{action form.cancel}} disabled={{form.isCancelling}}>
    {{if form.isCancelling "Cancelling..." "Cancel"}}
  </button>

  <button {{action form.submit}} disabled={{form.isUnsubmittable}}>
    {{if form.isSubmitting "Saving..." "Save"}}
  </button>
{{/fit-form}}
```

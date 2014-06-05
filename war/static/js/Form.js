


function Form() {
  
  /* {$} Form Element. */
  this.form;
  
  /**
   * 
   */
  this.init = function(opt_formOptions) {
    
  }
  
  /**
   * Builds a form Element.
   * @param {Array[String]} fields List of fields displayed.
   * @param {String} entityKind Kind of the entity.
   * @param {String} key Key of the entity.
   * @param {Array[String]} opt_dataLine Value of the field.
   */
  this.buildForm = function(fields, entityKind, key, opt_dataLine) {
    var dataLine = opt_dataLine || {};
    this.form = $('<form></form>');

    var input = this.buildInput('hidden', ENTITY_KIND_PROPERTY_NAME, 
        entityKind);
    this.form.append(input);
    
    var input = this.buildInput('hidden', ENTITY_KEY_PROPERTY_NAME, key);
    this.form.append(input);
    
    for (var i = 0; i < fields.length; i++) {
      var input = this.buildInput('text', fields[i], dataLine[i],
          fields[i]);
      this.form.append(input);
    }
    
    return this.form;
  }
  
  
  /**
   * Binds update click button.
   * @param {String || $} Selector 
   */
  this.bindUpdateClickButton = function(updateButton) {
    $(updateButton).click(this.launchesUpdate.bind(this));
  }
  
  
  /**
   * Launches update from the form. 
   */
  this.launchesUpdate = function() {
    console.log("launches Updates : " + JSON.stringify(this.serializeForm()));
    DATABASE_MANAGER.updateEntity(this.serializeForm());
  }
  
  
  /**
   * Serializes form.
   */
  this.serializeForm = function() {
    var formJson = {};
    var inputElements =  this.form.find('input');
    for (var i = 0; i < inputElements.length; i++) {
      var input = inputElements.eq(i);
      formJson[input.attr('name')] = input.val();
    }
    return formJson;
  }
  
  
  /**
   * Builds input element.
   */
  this.buildInput = function(type, name, value, opt_label) {
    var container = $('<tr></tr>');
    container.append('<td>' + (opt_label ? opt_label : '') + '</td>');
    var secondTd = $('<td></td>');
    var input = $('<input/>');
    input.attr('type', type);
    input.attr('name', name);
    input.attr('value', value);
    input.addClass('form-control')
    secondTd.append(input);
    container.append(secondTd);
    return container;
  }
  
  /**
   * Builds input element with boorstrap.
   */
  this.buildInput2 = function(type, name, value, opt_label) {
    var container = $('<tr></tr>');
    container.addClass('input-group');
    var secondTd = $('<td></td>');
    secondTd.html(opt_label ? opt_label : '');
    secondTd.addClass('input-group-addon');
    container.append(secondTd);
    var secondTd = $('<td></td>');
    var input = $('<input/>');
    input.addClass('form-control');
    input.attr('type', type);
    input.attr('name', name);
    input.attr('value', value);
    secondTd.append(input);
    container.append(secondTd);
    return container;
  }
}


function opt_formOptions() {
  this.datas;
  
}
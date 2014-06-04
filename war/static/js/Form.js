


function Form() {
  
  /* {$} Form Element. */
  this.form;
  
  /**
   * 
   */
  this.init = function(opt_formOptions) {
    
  }
  
  
  this.buildForm = function(fields, modelName, opt_dataLine) {
    this.form = $('<form></form>');
    var input = $('<input/>');
    input.attr('type', 'hidden');
    input.attr('name', 'modelName');
    input.attr('value', modelName);
    
    
  }
  
  
  
}


function opt_formOptions() {
  this.datas;
  
}
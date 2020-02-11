/** @module
An instance of an OWL class.*/

export default class Instance
{
  /** Human readable representation */
  label()
  {
    if(this.labels.length>0) {return this.labels[0];}
    if(this.altLabels.length>0) {return this.altLabels[0];}
    return this.suffix;
  }
  /** */
  constructor(uri,labels,altLabels,comments)
  {
    this.uri = uri;
    this.suffix = uri.replace(/.*\//,"");
    this.labels = labels;
    this.altLabels = altLabels;
    this.comments = comments;
  }
}

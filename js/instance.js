/** @module
An instance of an OWL class.*/

export default class Instance
{
  /** */
  constructor(uri,labels,altLabels,comments)
  {
    this.uri = uri;
    this.labels = labels;
    this.altLabels = altLabels;
    this.comments = comments;
  }
}

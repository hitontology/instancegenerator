/** @module
An instance of an OWL class.*/

/** returns string and language tag of a label*/
function labelParts(l) {return l.split("@");}

export default class Instance
{
  /** Human readable representation */
  label()
  {
    let label;
    const candidates = [...this.labels,...this.altLabels];

    for(const c of candidates)
    {
      for(const lang of ["en","de",""])
      {
        if(labelParts(c)[1]===lang)
        {
          label = labelParts(c)[0];
          return label;
        }
      }
    }
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

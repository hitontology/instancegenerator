/** @module
An RDF resource.*/
import * as rdf from "./rdf.js";

export default class Resource
{
  /** Singular human readable representation chosen among multiple candidates.*/
  label()
  {
    /** returns string and language tag of a label*/
    const labelParts = (l)=> l.split("@");

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

  /** Labels, altLabels and comments are arrays of strings that can be empty. */
  constructor(uri,labels,altLabels,comments)
  {
    this.uri = uri;
    this.suffix = rdf.niceSuffix(uri);
    this.labels = labels;
    this.altLabels = altLabels;
    this.comments = comments;
  }
}

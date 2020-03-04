/**
Fuzzy search index with fuse.js.
@module */

const options =
{
  shouldSort: true,
  tokenize: true,
  threshold: 0.25,
  maxPatternLength: 40,
  minMatchCharLength: 3,
  matchAllTokens: true,
  location: 0,
  distance: 100,
  id: "uri",
  keys:
  [
    {name:"l", weight: 0.9}, // label
    {name:"al", weight: 0.6}, // alternative label
    {name:"suffix", weight: 0.5},
    {name:"cmt", weight: 0.4}, // alternative label
  ],
};

/** Fulltext index of all instances of a class. */
export default class ResourceIndex
{
  /** Fills the index with the instances .*/
  constructor(resources)
  {
    const items = [];
    for(const r of resources)
    {
      const labels = [...new Set([...r.labels,r.suffix])]; // remove duplicates
      const item = {uri: r.uri, l: labels, al: r.alternativeLabel, suffix: r.suffix, cmt: r.comments};
      items.push(item);
    }
    // @ts-ignore // Fuse is a global
    this.index = new Fuse(items,options);
  }

  /** Searches the Fuse index for classes with a similar label. Needs to be initialized before use.
    @param {string} userQuery
    @return {Promise<string[]>} the class URIs found.
    */
  search(userQuery)
  {
    return this.index.search(userQuery);
  }
}

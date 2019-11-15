const makeItemLink = (slug) => `#${slug}`

module.exports = function (config) {
  // Add a filter using the Config API
  config.addFilter('linkTarget', makeItemLink);

  config.addFilter('linkIfExistsInCollection', (word, collection) => {
    const existingDefinition = collection.find(item => item.data.title === word)

    if (existingDefinition) {
      return `<a href=${makeItemLink(existingDefinition.data.slug)}>${word}</a>`
    }

    return word
  })

  // just a debug filter to lazily inspect the content of anything in a template
  config.addFilter('postInspect', function (post) {
    console.log(post);
  })

  config.addPassthroughCopy({'_site/css/': 'assets/css/'})


  // NOTE (ovlb): this will not be remembered as the best code i’ve written. if anyone seeing this has a better solution then the following to achieve sub groups of the definitions: i am happy to get rid of it
  config.addCollection('definitions', collection => {
    const allItems = collection
        .getFilteredByGlob('./11ty/definitions/*.md')
        .sort((a, b) => {
          // `localeCompare()` is super cool: http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
          return a.data.title.toLowerCase().localeCompare(b.data.title.toLowerCase())
        })

    const split = {
      notLetters: {
        title: '#',
        definitions: []
      },
      aToE: {
        title: 'A–E',
        definitions: []
      },
      fToL: {
        title: 'F–L',
        definitions: []
      },
      mToS: {
        title: 'M–S',
        definitions: []
      },
      tToZ: {
        title: 'T–Z',
        definitions: []
      }
    }

    allItems.forEach(word => {
      const { title } = word.data
      const { notLetters, aToE, fToL, mToS, tToZ } = split

      if (/^[a-e]/gmi.test(title)) {
        return aToE.definitions.push(word)
      }

      if (/^[f-l]/i.test(title)) {
        return fToL.definitions.push(word)
      }

      if (/^[m-s]/i.test(title)) {
        return mToS.definitions.push(word)
      }

      if (/^[t-z]/i.test(title)) {
        return tToZ.definitions.push(word)
      }

      // no reg ex as the fallback to avoid testing for emojis and numbers
      notLetters.definitions.push(word)
    })

    return Object.keys(split).map(key => {
      const { title, definitions } = split[key]

      return { title, definitions }
    })
  })

  config.addCollection('definedWords', collection => {
    return collection
        .getFilteredByGlob('./11ty/definitions/*.md')
        .filter(word => word.data.defined)
        .sort((a, b) => {
          // `localeCompare()` is super cool: http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
          return a.data.title.toLowerCase().localeCompare(b.data.title.toLowerCase())
        })
  })

  // You can return your Config object (optional).
  return {
    dir: {
      input: '11ty',
      output: 'dist'
    },
    templateFormats: ['njk', 'md'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    passthroughFileCopy: true
  };
};

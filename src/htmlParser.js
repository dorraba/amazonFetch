import _ from 'lodash';

class HtmlParser {
  getReviewsCount = (html) => {
    return _.chain(html.match(/<span id="acrCustomerReviewText".*?s*class="a-size-base">(.*?) customer review[s]?<\/span>/mi))
                            .get('[1]')
                            .replace(',','')
                            .toNumber()
                            .value()
  }

  getRatings = (html) => _.chain(html.match(/<span id="acrPopover".*?title="(.*?) out of 5 stars">/mi))
                            .get('[1]')
                            .replace(',','')
                            .toNumber()
                            .value()

  getSalesRankData = (html) =>  _.chain(html.match(/#(.*?) in (.*?)\(?<a.*?\/gp\/bestsellers.*?See/mi))
                                .thru(match => ({
                                  salesRank: _.chain(match)
                                              .get('[1]')
                                            .replace(',','')
                                            .toNumber()
                                            .value(),
                                  category: _.chain(match)
                                            .get('[2]')
                                            .toLower()
                                            .trim()
                                            .value()
                                }))
                                .value()

  getFulfillmenet = (html) => {
    const fba = html.match(/>fulfilled by amazon<\/a>/m) && 'fba';
    const amz = !fba && html.match(/sold by +amazon/m) && 'amz';
    return fba || amz || 'fbm';
  }

  getBuyBoxSellers = html => {
    const matches = html.match(/new<\/b> \((.*?)\) from/m);
    return _.toNumber(_.get(matches, '[1]'));
  }
}

export default new HtmlParser();
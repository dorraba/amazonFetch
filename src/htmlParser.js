import _ from 'lodash';

class HtmlParser {
  getReviewsCount = ($) => _.chain($('#acrcustomerreviewtext').text())
                            .toString()
                            .split(' ')
                            .get('[0]')
                            .replace(',','')
                            .toNumber()
                            .value()

  getRatings = ($) => _.chain($('#averagecustomerreviews .a-icon-star').text())
                        .toString()
                        .split(' ')
                        .get('[0]')
                        .replace(',','')
                        .toNumber()
                        .value()

  getSalesRankData = ($) => {

    const hasBSRtext = _.curry((index, element) => _.includes($(element).text(), 'best sellers rank'))
    const findBSRmatches = (str) => str.match(/#(.*?) in (.*?)<a.*?\/gp\/bestsellers.*?See/mi)
    let bsrElement = $('.proddetsectionentry').filter(hasBSRtext);
    let html = bsrElement.parent() && bsrElement.parent().html();
    if (!html) {
      html = $('#salesrank').html();
    }
    if (html) {
      return _.chain(html)
            .defaultTo('')
            .thru(findBSRmatches)
            .thru(matches => {
              return {
                salesRank: _.chain(matches || [])
                            .get('[1]')
                            .replace(',', '')
                            .toNumber()
                            .value(),
                category: _.chain(matches || [])
                            .get('[2]')
                            .unescape()
                            .replace('(', '')
                            .trim()
                            .value(),
            }}).value();
    }
    return {salesRank: 0, category: ''};
  }

  getFulfillmenet = ($) => {
    const element = $('#merchant-info').html();
    if (!element) {
      return null;
    }
    const fba = element.match(/>fulfilled by amazon<\/a>/m) && 'fba';
    const amz = element.match(/sold by +amazon/m) && 'amz';
    return fba || amz || 'fbm';
  }

  getBuyBoxSellers = ($) => {
    const element = $('#mbc-action-panel-wrapper').html();
    if (!element) {
      return null;
    }
    const matches = element.match(/new<\/b> \((.*?)\) from/m);
    return _.toNumber(_.get(matches, '[1]'));
  }
}

export default new HtmlParser();
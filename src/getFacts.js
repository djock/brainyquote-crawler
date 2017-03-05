import axios from './utils/aaxios.js';
import cheerio from 'cheerio';

const categories = {
    "world" : [12, 13, 14, 15, 16, 17, 18, 47, 19, 20],
    "history": [25, 28],
    "society": [37, 29, 36, 35, 45, 33, 32, 31, 30, 34, 43, 38],
    "nature": [39, 44, 42, 41, 46]
};

const baseURL = 'http://www.factslides.com';

async function getFacts() {
    const resTarget = await axios.get(baseURL).catch(resTarget => {
        throw resTarget;
    });
    const resTargetData = resTarget.data;
    let targetData = cheerio.load(resTargetData);
    let categoriesLinks = {};

    let resultJSON = {};
    let dataIndex = 0;

    targetData('#slideshows_menu #slideshows_menu_left > div').each(function(i, elem) {
        let link = targetData(this).find('a').attr('href');
        let thisIndex = targetData(this).attr('class').replace('slideshows_menu_', '').replace(' ', '');

        if(thisIndex.length == 2) {
            categoriesLinks[link] = parseInt(thisIndex);
        }
    });
    for (let link in categoriesLinks) {
        // get caategory
        let currentCategory = '';

        for(let i in categories) {
            if(categoriesLinks[link]) {
                if(categories[i].includes(categoriesLinks[link])) {
                    currentCategory = i;
                    console.log(currentCategory);
                }                    
            }
        }

        let categoryURL = baseURL.concat(link);
        const resCategory = await axios.get(categoryURL).catch(function resCategory(error) {
            if (error.response) {
                console.log('error: ', error.response);
                return;
            } else
                throw resCategory;
        });
        if(resCategory.data){
            let resCategoryData = resCategory.data;

            const itemsSourceReg = /(\bitemsSource\b.*)/g;
            const sourceLinkReg = /(\bhttp\b.+?\,)/g;

            let itemsSourceText = itemsSourceReg.exec(resCategoryData);
            let sourceLinksArray;

            if(itemsSourceText) {
                let itemsSourceString = itemsSourceText.toString();
                sourceLinksArray = itemsSourceString.match(sourceLinkReg);
            }
            
            let categoryData = cheerio.load(resCategoryData);

            categoryData('#items ol > div.i').each(function(i, elem) {
                let text = targetData(this).find('li').text();
                let currentSource;

                if(sourceLinksArray) {
                    currentSource = sourceLinksArray[i] ?  sourceLinksArray[i].replace(/'.*$/g, "") : null;
                }

                dataIndex++;
                let data = {
                    id: dataIndex,
                    text: text,
                    source: currentSource ? currentSource.replace(/',/g, "") : '',
                    category: currentCategory
                };
                console.log(data);
                console.log('----------');
                resultJSON[dataIndex] = data;
            });
            }
        }
        
        
    return resultJSON;
}

export default getFacts;

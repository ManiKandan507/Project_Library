import {useMemo} from 'react'
import { convertLowercaseFormat } from '@/AnalyticsAll/StatComponents/utils';

const useProductModalDataConstruct = (type, searchText, products) => {

    const filteredFileType = () => {
        let results = [...products];
        if( type !== 'all'){
            results = results.filter((data)=> data?.file_type === type)
        }
        if (searchText) {
            results = results.filter((data)=> convertLowercaseFormat(`${data?.product_label}`).includes(searchText))
        }
        results.map(data => {
          return {
            ...data,
            parent: data?.product_hierarchy?.parent.sort(
              (rec1, rec2) => rec1?.immediate_parent - rec2?.immediate_parent
            ),
          };
        });
        return results;
      };

    const dataSource = useMemo(() => {
        return filteredFileType();
      }, [type, searchText, products]);
      
  return dataSource
}

export default useProductModalDataConstruct
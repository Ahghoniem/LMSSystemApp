import { concatLang, getLang } from "../../../../Utils";
const lang =getLang()


    export const uniSearch=(data) => {
        const unis = (data?.data?.data || []).map((item) => ({
            value: concatLang(item.NameEn,item.NameAr),
            label: lang === "ar" ? item.NameAr : item.NameEn,
          }));
          return unis
    }
        
    export const UniDefaultValue=(unis,formValues) => {
        const defaultUniOption = unis?.data?.data.find(
            (opt) => opt.value === formValues
          ) || null;
          return defaultUniOption
    }

   export const CollageSearch=(collages) => {
    const colls = (collages?.data?.data || []).map((item) => ({
        value: concatLang(item.nameEn,item.nameAr),
        label: lang === "ar" ? item.nameAr : item.nameEn,
      }));
      return colls
   }


    export const CollDefaultValue=(colls,formValues) => {
        const defaultCollOption = colls.find(
            (opt) => opt.value === formValues.faculty
          ) || null;
          return defaultCollOption
    }
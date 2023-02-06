
import DatabaseInit from '../config/database.init';
const main = (async ()=>{
    await DatabaseInit.init();
})();
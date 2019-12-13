import "babel-polyfill";


import {binder, fwa} from "./libs/binder";
import "gsap/dist/gsap";

import { constants } from "./modules/module";
import { functionName } from "./modules/practice";


binder({
    bounds: {
        "html": functionName
    },
    runTests: false
});

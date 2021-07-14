namespace com.sap.ibso.core.model;

using {
    managed,
    cuid
} from '@sap/cds/common';


entity House : cuid, managed {
    address : String(255);
    price   : Decimal(20, 2);
}

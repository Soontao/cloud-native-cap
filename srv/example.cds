namespace com.sap.ibso.core.service;

using {com.sap.ibso.core.model} from '../db/db';

service ExampleService {

    entity Houses as projection on model.House;

}

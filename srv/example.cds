namespace com.sap.ibso.core.service;

using {com.sap.ibso.core.model} from '../db/db';

service ExampleService {

  entity Houses @(restrict : [
    {
      grant : 'READ',
      to    : 'READ_HOUSE',
    },
    {
      grant : [
        'UPDATE',
        'DELETE',
        'CREATE'
      ],
      to    : 'WRITE_HOUSE',
    }
  ]) as projection on model.House;

}

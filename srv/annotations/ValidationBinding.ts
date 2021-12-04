import Ajv from "ajv";
import { MetadataType } from "./Metadata";

interface ValidationMetadata {
  parameterIndex: number;
  validator: Validator;
}

type Validator = (value: any) => void;

const ajv = new Ajv();

export function ajvValidator(schema: any): Validator {
  const doValidate = ajv.compile(schema);
  return (value: any) => {
    const valid = doValidate(value);
    if (!valid) {
      throw new Error(doValidate.errors.map((error) => `${error.instancePath} ${error.message}`).join(", "));
    }
  };
}

/**
 * validate request data
 *
 * @param validator
 * @returns
 */
export function ValidRequestData(validator: Validator): ParameterDecorator {
  return Valid((value) => validator(value?.data));
}

export function Valid(validator: Validator): ParameterDecorator {
  return function (target: Object, propertyKey: string | symbol, parameterIndex: number): void {
    const bindings: Array<ValidationMetadata> = getValidationBindings(target, propertyKey);
    bindings.push({ parameterIndex, validator });
    Reflect.defineMetadata(MetadataType.ValidBinding, bindings, target, propertyKey);
  };
}

export function getValidationBindings(target: any, propertyKey: any): Array<ValidationMetadata> {
  return Reflect.getMetadata(MetadataType.ValidBinding, target, propertyKey) ?? [];
}

export function wrapWithValidation(target: any, propertyKey: any): Function {
  const bindings = getValidationBindings(target, propertyKey);
  if (bindings.length == 0) {
    return target[propertyKey].bind(target);
  }
  return function (...args: any[]) {
    for (const binding of bindings) {
      binding.validator(args[binding.parameterIndex]);
    }
    return target[propertyKey].call(target, ...args);
  };
}

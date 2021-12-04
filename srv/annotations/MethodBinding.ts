import { Event, Service } from "@sap/cds/apis/services";
import "reflect-metadata";
import { Metadata, MetadataType } from "./Metadata";
import { wrapWithValidation } from "./ValidationBinding";

export enum Hook {
  before = "before",
  on = "on",
  after = "after"
}

export interface MethodBindingMetadata extends Metadata {
  /**
   * class method
   */
  classMethod: string | symbol;
  /**
   * the CDS lifecycle hook
   */
  hook: Hook;
  /**
   * CDS entity name
   */
  entity?: string;
  /**
   * CDS event
   */
  event?: Event;
}

const createBindingAnnotation =
  (hook: Hook) =>
    (event: Event) =>
      (entity?: string): MethodDecorator => {
        return function (target: any, propertyKey: string | symbol) {
          const bindings: Array<MethodBindingMetadata> = getMethodBindings(target);
          bindings.push({
            type: MetadataType.MethodBinding,
            entity: entity,
            event: event,
            classMethod: propertyKey,
            hook: hook
          });
          Reflect.defineMetadata(MetadataType.MethodBinding, bindings, target);
        };
      };

export const getMethodBindings = (target: Service): Array<MethodBindingMetadata> => {
  return Reflect.getMetadata(MetadataType.MethodBinding, target) ?? [];
};

/**
 * apply method mappings
 *
 * @param target
 */
export const applyMethodBindings = (target: Service): void => {
  const bindings = getMethodBindings(target);
  bindings.forEach((binding) => {
    // srv.before/on/after(entity, handler)
    // @ts-ignore
    target[binding.hook](binding.event, binding.entity, wrapWithValidation(target, binding.classMethod));
  });
};

export const Before = createBindingAnnotation(Hook.before);
export const BeforeRead = Before("READ");
export const BeforeUpdate = Before("UPDATE");
export const BeforeDelete = Before("DELETE");
export const BeforeCreate = Before("CREATE");

export const On = createBindingAnnotation(Hook.on);
export const OnRead = On("READ");
export const OnUpdate = On("UPDATE");
export const OnDelete = On("DELETE");
export const OnCreate = On("CREATE");

export const After = createBindingAnnotation(Hook.after);
export const AfterRead = After("READ");
export const AfterUpdate = After("UPDATE");
export const AfterDelete = After("DELETE");
export const AfterCreate = After("CREATE");

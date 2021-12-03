import { Event, Service } from "@sap/cds/apis/services";
import "reflect-metadata";
import { Metadata, MetadataType } from "./Metadata";

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
  (hook: Hook, event: Event) =>
    (entity?: string): MethodDecorator => {
      return function (target: Object, propertyKey: string | symbol) {
        const bindings: Array<MethodBindingMetadata> = Reflect.getMetadata(MetadataType.MethodBinding, target) ?? [];
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
  return Reflect.getMetadata(MetadataType.MethodBinding, target);
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
    target[binding.hook](binding.event, binding.entity, target[binding.classMethod].bind(target));
  });
};

export const BeforeRead = createBindingAnnotation(Hook.before, "READ");
export const BeforeUpdate = createBindingAnnotation(Hook.before, "UPDATE");
export const BeforeDelete = createBindingAnnotation(Hook.before, "DELETE");
export const BeforeCreate = createBindingAnnotation(Hook.before, "CREATE");

export const OnRead = createBindingAnnotation(Hook.on, "READ");
export const OnUpdate = createBindingAnnotation(Hook.on, "UPDATE");
export const OnDelete = createBindingAnnotation(Hook.on, "DELETE");
export const OnCreate = createBindingAnnotation(Hook.on, "CREATE");

export const AfterRead = createBindingAnnotation(Hook.after, "READ");
export const AfterUpdate = createBindingAnnotation(Hook.after, "UPDATE");
export const AfterDelete = createBindingAnnotation(Hook.after, "DELETE");
export const AfterCreate = createBindingAnnotation(Hook.after, "CREATE");

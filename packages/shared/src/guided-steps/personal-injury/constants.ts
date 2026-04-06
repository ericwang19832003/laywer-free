import type { PiSubType } from '@lawyer-free/shared/schemas/case'

export const PROPERTY_DAMAGE_SUB_TYPES: PiSubType[] = [
  'vehicle_damage',
  'property_damage_negligence',
  'vandalism',
  'other_property_damage',
]

export function isPropertyDamageSubType(subType?: string): boolean {
  return PROPERTY_DAMAGE_SUB_TYPES.includes(subType as PiSubType)
}

export const MOTOR_VEHICLE_SUB_TYPES: PiSubType[] = [
  'auto_accident',
  'pedestrian_cyclist',
  'rideshare',
  'uninsured_motorist',
]

export function isMotorVehicleSubType(subType?: string): boolean {
  return MOTOR_VEHICLE_SUB_TYPES.includes(subType as PiSubType)
}

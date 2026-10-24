import type {
  ReportTargetTypeInput,
  SocialAction,
  SocialConfigResponse,
  SocialConfigTargetKey,
  SocialOperation,
  SocialTargetType,
  SocialTargetTypeInput,
} from '@/types';

export function socialConfigTargetKey(
  target: SocialTargetType | SocialTargetTypeInput | ReportTargetTypeInput,
): SocialConfigTargetKey {
  switch (target) {
    case 'tripGroup':
    case 'tripgroup':
      return 'tripGroup';
    case 'day':
    case 'trip':
      return 'trip';
    case 'point':
    case 'image':
    case 'comment':
      return target;
    default: {
      const exhaustive: never = target;
      return exhaustive;
    }
  }
}

export function isSocialOperationAllowed(
  config: SocialConfigResponse | undefined,
  action: SocialAction,
  targetKey: SocialConfigTargetKey,
  operation: SocialOperation,
  contextKey?: SocialConfigTargetKey,
): boolean {
  const actionConfig = config?.social.find((item) => item.key === action);
  if (!actionConfig?.isActive) {
    return false;
  }

  const target = actionConfig.targets.find((item) => item.key === targetKey);
  if (!target) {
    return false;
  }

  if (action === 'replyComment') {
    if (!contextKey) {
      return false;
    }
    return target.contextRules?.find((rule) => rule.key === contextKey)?.operations[operation] === true;
  }

  return target.operations[operation] === true;
}

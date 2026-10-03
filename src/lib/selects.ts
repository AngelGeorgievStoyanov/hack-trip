import type { SelectConfigDto, SelectOptionDto } from '@/types';

/**
 * Runtime select helpers shared by every consumer of `GET /config/selects`.
 *
 * An option's `key` is the canonical value the backend stores and expects in requests; the
 * option's `value` is only the display label.
 */

export interface SelectChoice {
  value: string;
  label: string;
}

function toChoice(option: SelectOptionDto): SelectChoice {
  return { value: option.key, label: option.value };
}

function findOptions(configs: SelectConfigDto[], typeKey: string): SelectOptionDto[] {
  return configs.find((config) => config.key === typeKey)?.options ?? [];
}

/**
 * Selectable choices of one select type, in backend order, active options only.
 *
 * A `currentValue` that the runtime config no longer offers is kept as an extra choice, so a
 * legacy or deactivated trip value stays visible and selectable instead of being silently
 * replaced.
 */
export function toSelectChoices(
  configs: SelectConfigDto[],
  typeKey: string,
  currentValue?: string,
): SelectChoice[] {
  const choices = findOptions(configs, typeKey)
    .filter((option) => option.isActive)
    .map(toChoice);

  if (currentValue && !choices.some((choice) => choice.value === currentValue)) {
    return [{ value: currentValue, label: currentValue }, ...choices];
  }

  return choices;
}

/** First configured choice, used while a consumer has no value of its own to fall back on. */
export function firstSelectValue(choices: SelectChoice[]): string {
  return choices[0]?.value ?? '';
}

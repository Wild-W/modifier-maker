INSERT INTO
  PolicyModifiers (ModifierId, PolicyType)
VALUES
  ('POLICY_TEST_MODIFIER', 'POLICY_TEST');

INSERT INTO
  GameModifiers (ModifierId)
VALUES
  ('POLICY_TEST_MODIFIER');

INSERT INTO
  TraitModifiers (ModifierId, TraitType)
VALUES
  ('POLICY_TEST_MODIFIER', 'TEST_TRAIT');

INSERT INTO
  Modifiers (ModifierId, ModifierType, SubjectRequirementSetId)
VALUES
  (
    'POLICY_TEST_MODIFIER',
    'MODTYPE_POLICY_TEST_MODIFIER',
    'REQSET_POLICY_TEST_MODIFIER'
  );

INSERT INTO
  DynamicModifiers (ModifierType, CollectionType, EffectType)
VALUES
  (
    'MODTYPE_POLICY_TEST_MODIFIER',
    'COLLECTION_PLAYER_CAPITAL_CITY',
    'EFFECT_ADJUST_CITY_HIT_POINTS'
  );

INSERT INTO
  Types (Type, Kind)
VALUES
  ('MODTYPE_POLICY_TEST_MODIFIER', 'KIND_MODIFIER');

INSERT INTO
  ModifierArguments (ModifierId, Name, Value)
VALUES
  ('POLICY_TEST_MODIFIER', 'Amount', -100);

INSERT INTO
  RequirementSets (RequirementSetId, RequirementSetType)
VALUES
  (
    'REQSET_POLICY_TEST_MODIFIER',
    'REQUIREMENTSET_TEST_ANY'
  );

INSERT INTO
  RequirementSetRequirements (RequirementSetId, RequirementId)
VALUES
  (
    'REQSET_POLICY_TEST_MODIFIER',
    'REQ_POLICY_TEST_MODIFIER_0'
  ),
  (
    'REQSET_POLICY_TEST_MODIFIER',
    'REQ_POLICY_TEST_MODIFIER_1'
  );

INSERT INTO
  RequirementArguments (RequirementId, Name, Value, Type)
VALUES
  (
    'REQ_POLICY_TEST_MODIFIER_0',
    'PropertyName',
    'WW_test_property',
    (default)
  ),
  (
    'REQ_POLICY_TEST_MODIFIER_0',
    'PropertyMinimum',
    1,
    (default)
  ),
  (
    'REQ_POLICY_TEST_MODIFIER_1',
    'Amount',
    2,
    (default)
  );

INSERT INTO
  Requirements (RequirementId, RequirementType)
VALUES
  (
    'REQ_POLICY_TEST_MODIFIER_0',
    'REQUIREMENT_PLOT_PROPERTY_MATCHES'
  ),
  (
    'REQ_POLICY_TEST_MODIFIER_1',
    'REQUIREMENT_CITY_IS_ORIGINAL_CAPITAL'
  );
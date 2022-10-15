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
    'REQUIREMENTSET_TEST_ALL'
  );

INSERT INTO
  RequirementSetRequirements (RequirementSetId, RequirementId)
VALUES
  (
    'REQSET_POLICY_TEST_MODIFIER',
    'REQ_POLICY_TEST_MODIFIER_0'
  );

INSERT INTO
  RequirementArguments (RequirementId, Name, Value)
VALUES
  (
    'REQ_POLICY_TEST_MODIFIER_0',
    'PropertyName',
    'WW_test_property'
  ),
  (
    'REQ_POLICY_TEST_MODIFIER_0',
    'PropertyMinimum',
    1
  );

INSERT INTO
  Requirements (RequirementId, RequirementType)
VALUES
  (
    'REQ_POLICY_TEST_MODIFIER_0',
    'REQUIREMENT_PLOT_PROPERTY_MATCHES'
  );
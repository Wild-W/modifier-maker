INSERT INTO
  PolicyModifiers (ModifierId, PolicyType)
VALUES
  ('POLICY_TEST_MODIFIER', 'POLICY_TEST');

INSERT INTO
  Modifiers (
    ModifierId,
    ModifierType,
    RunOnce,
    NewOnly,
    Permanent,
    Repeatable,
    OwnerStackLimit,
    SubjectStackLimit,
    OwnerRequirementSetId,
    SubjectRequirementSetId
  )
VALUES
  (
    'POLICY_TEST_MODIFIER',
    'MODTYPE_POLICY_TEST_MODIFIER',
    0,
    0,
    0,
    0,
    0,
    0,
    NULL,
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
  ModifierArguments (ModifierId, Name, Value, Type, Extra, SecondExtra)
VALUES
  (
    'POLICY_TEST_MODIFIER',
    'Amount',
    -100,
    'ARGTYPE_IDENTITY',
    NULL,
    NULL
  );

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
  );

INSERT INTO
  RequirementArguments (
    RequirementId,
    Name,
    Value,
    Type,
    Extra,
    SecondExtra
  )
VALUES
  (
    'REQ_POLICY_TEST_MODIFIER_0',
    'PropertyName',
    'WW_test_property',
    'ARGTYPE_IDENTITY',
    NULL,
    NULL
  ),
  (
    'REQ_POLICY_TEST_MODIFIER_0',
    'PropertyMinimum',
    1,
    'ARGTYPE_IDENTITY',
    NULL,
    NULL
  );

INSERT INTO
  Requirements (
    RequirementId,
    RequirementType,
    Likeliness,
    Impact,
    Inverse,
    Reverse,
    Persistent,
    ProgressWeight,
    Triggered
  )
VALUES
  (
    'REQ_POLICY_TEST_MODIFIER_0',
    'REQUIREMENT_PLOT_PROPERTY_MATCHES',
    0,
    0,
    0,
    0,
    0,
    0,
    0
  );
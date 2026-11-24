import * as migration_20261019_120216_initial_payload_schema from './20261019_120216_initial_payload_schema';
import * as migration_20261124_071057_client_facing_sections from './20261124_071057_client_facing_sections';
import * as migration_20261124_080702_project_case_study from './20261124_080702_project_case_study';

export const migrations = [
  {
    up: migration_20261019_120216_initial_payload_schema.up,
    down: migration_20261019_120216_initial_payload_schema.down,
    name: '20261019_120216_initial_payload_schema',
  },
  {
    up: migration_20261124_071057_client_facing_sections.up,
    down: migration_20261124_071057_client_facing_sections.down,
    name: '20261124_071057_client_facing_sections',
  },
  {
    up: migration_20261124_080702_project_case_study.up,
    down: migration_20261124_080702_project_case_study.down,
    name: '20261124_080702_project_case_study'
  },
];

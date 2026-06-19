import { Grid, Card } from '@depot/web';

const UnitCard = ({ name, role, pts }: { name: string; role: string; pts: string }) => (
  <Card>
    <Card.Header>
      <div>
        <Card.Title>{name}</Card.Title>
        <Card.Subtitle>{role}</Card.Subtitle>
      </div>
      <Card.BadgeGroup>
        <Card.Badge variant="accent">{pts}</Card.Badge>
      </Card.BadgeGroup>
    </Card.Header>
  </Card>
);

export const UnitGrid = () => (
  <Grid cols={3} gap="md" responsive={false}>
    <UnitCard name="Intercessor Squad" role="Battleline" pts="80 pts" />
    <UnitCard name="Terminator Squad" role="Elites" pts="185 pts" />
    <UnitCard name="Redemptor Dreadnought" role="Vehicle" pts="210 pts" />
    <UnitCard name="Captain in Gravis" role="Character" pts="105 pts" />
    <UnitCard name="Assault Intercessors" role="Battleline" pts="75 pts" />
    <UnitCard name="Repulsor Executioner" role="Vehicle" pts="220 pts" />
  </Grid>
);

export const TwoColumn = () => (
  <Grid cols={2} gap="lg" responsive={false}>
    <UnitCard name="Hive Tyrant" role="Character" pts="225 pts" />
    <UnitCard name="Termagant Swarm" role="Battleline" pts="60 pts" />
    <UnitCard name="Carnifex" role="Heavy" pts="125 pts" />
    <UnitCard name="Genestealers" role="Infantry" pts="115 pts" />
  </Grid>
);

export const FourColumn = () => (
  <Grid cols={4} gap="sm" responsive={false}>
    <UnitCard name="Necron Warriors" role="Battleline" pts="100 pts" />
    <UnitCard name="Immortals" role="Infantry" pts="85 pts" />
    <UnitCard name="Lychguard" role="Elites" pts="90 pts" />
    <UnitCard name="Doomsday Ark" role="Vehicle" pts="200 pts" />
  </Grid>
);

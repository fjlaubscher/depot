import { LinkCard } from '@depot/web';
import { Shield, Users, Swords } from 'lucide-react';

export const FactionLink = () => (
  <div style={{ maxWidth: 360 }}>
    <LinkCard to="/factions/space-marines" description="Adeptus Astartes — 1,200 datasheets" showArrow>
      Space Marines
    </LinkCard>
  </div>
);

export const WithIcon = () => (
  <div style={{ maxWidth: 360 }}>
    <LinkCard
      to="/rosters/strike-force-ultra"
      description="Ultramarines — 2,000 pts"
      icon={<Shield className="h-5 w-5" />}
    >
      Strike Force Ultra
    </LinkCard>
  </div>
);

export const Plain = () => (
  <div style={{ maxWidth: 360 }}>
    <LinkCard to="/datasheets/captain">Captain in Terminator Armour</LinkCard>
  </div>
);

export const Grid = () => (
  <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
    <LinkCard
      to="/factions/necrons"
      description="Xenos — Dynastic legions"
      icon={<Swords className="h-5 w-5" />}
    >
      Necrons
    </LinkCard>
    <LinkCard
      to="/factions/astra-militarum"
      description="Imperium — Massed infantry"
      icon={<Users className="h-5 w-5" />}
    >
      Astra Militarum
    </LinkCard>
    <LinkCard to="/factions/orks" description="Xenos — Greenskin hordes" showArrow>
      Orks
    </LinkCard>
  </div>
);

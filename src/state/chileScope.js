/** Remove unsupported countries from earlier demo drafts without relabelling
 * foreign legal entities as Chilean. Existing progress and other data survive. */
export function restrictToChile(state) {
  const org = state.organization
  const country = value => value && value !== 'CL' ? '' : value
  const operating = values => (values ?? []).filter(value => value === 'CL')
  const profile = org.kybProfile
  const next = {
    ...org,
    countryOfIncorporation: country(org.countryOfIncorporation),
    operatingCountries: operating(org.operatingCountries),
    legalEntities: org.legalEntities
      .filter(entity => entity.role === 'primary' || !entity.country || entity.country === 'CL')
      .map(entity => ({ ...entity, country: country(entity.country) })),
    ...(profile && { kybProfile: {
      ...profile,
      ...(profile.legal && { legal: { ...profile.legal, country: country(profile.legal.country) } }),
      ...(profile.activity && { activity: { ...profile.activity, operatingCountries: operating(profile.activity.operatingCountries) } }),
    } }),
  }
  return JSON.stringify(next) === JSON.stringify(org) ? state : { ...state, organization: next }
}

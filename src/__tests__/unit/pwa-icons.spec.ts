interface ManifestIcon {
  src: string
  type: string
  sizes: string
}

interface AppManifest {
  icons: ManifestIcon[]
}

const manifest = require('../../../public/manifest.json') as AppManifest

describe('PWA icons', () => {
  it('uses the Crystal Path logo for every installed-app icon', () => {
    expect(manifest.icons.map(icon => icon.src)).toEqual(expect.arrayContaining([
      'crystal_path_logo.png',
      'crystal_path_logo.svg',
    ]))
    expect(manifest.icons.every(icon => /^crystal_path_logo\.(png|svg)$/.test(icon.src))).toBe(true)
  })

  it('declares icon media types and sizes for the logo assets', () => {
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({
        src: 'crystal_path_logo.png',
        type: 'image/png',
        sizes: '512x512',
      }),
      expect.objectContaining({
        src: 'crystal_path_logo.svg',
        type: 'image/svg+xml',
        sizes: 'any',
      }),
    ]))
  })
})

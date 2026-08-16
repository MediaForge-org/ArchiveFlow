//! Source-neutral thumbnail sizing.
//!
//! Fixes the pure "how big should the generated thumbnail be" logic shared
//! by every source's images/videos. Actual image/video decoding backends
//! land in a later package.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Dimensions {
    pub width: u32,
    pub height: u32,
}

/// Scales `source` down to fit within `max_edge` on its longest side,
/// preserving aspect ratio. Never upscales.
pub fn fit_within(source: Dimensions, max_edge: u32) -> Dimensions {
    let longest = source.width.max(source.height);
    if longest <= max_edge || longest == 0 {
        return source;
    }

    let scale = f64::from(max_edge) / f64::from(longest);
    Dimensions {
        width: ((f64::from(source.width) * scale).round() as u32).max(1),
        height: ((f64::from(source.height) * scale).round() as u32).max(1),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn downscales_landscape_image_preserving_aspect_ratio() {
        let result = fit_within(
            Dimensions {
                width: 4000,
                height: 2000,
            },
            400,
        );
        assert_eq!(
            result,
            Dimensions {
                width: 400,
                height: 200
            }
        );
    }

    #[test]
    fn downscales_portrait_video_frame_preserving_aspect_ratio() {
        let result = fit_within(
            Dimensions {
                width: 1080,
                height: 1920,
            },
            300,
        );
        assert_eq!(
            result,
            Dimensions {
                width: 169,
                height: 300
            }
        );
    }

    #[test]
    fn never_upscales_smaller_than_target() {
        let small = Dimensions {
            width: 100,
            height: 50,
        };
        assert_eq!(fit_within(small, 400), small);
    }

    #[test]
    fn zero_sized_source_is_returned_unchanged_not_a_panic() {
        let zero = Dimensions {
            width: 0,
            height: 0,
        };
        assert_eq!(fit_within(zero, 400), zero);
    }
}

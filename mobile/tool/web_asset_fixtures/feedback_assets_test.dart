import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:speakup/design/speak_up_components.dart';
import 'package:speakup/design/speak_up_theme.dart';
import 'package:speakup/features/coaching/evaluation/turn_feedback.dart';
import 'package:speakup/features/coaching/evaluation/turn_feedback_controller.dart';
import 'package:speakup/features/coaching/practice/practice_message_bubble.dart';
import 'package:speakup/features/coaching/practice/practice_models.dart';

const _assetBoundaryKey = Key('feedback-web-asset');
const _statusUrl =
    '/v1/practice-turns/20000000-0000-4000-8000-000000000001/evaluation';
const _outputDirectory =
    '../speakup-practice-edition-local/assets/speakup/outcomes/feedback';

enum _FeedbackAssetState { collapsed, correction, natural }

void main() {
  setUpAll(_loadFixtureFonts);

  testWidgets('renders the collapsed answer asset', (tester) async {
    await _renderAsset(
      tester,
      state: _FeedbackAssetState.collapsed,
      outputName: 'original-collapsed.png',
    );
  });

  testWidgets('renders the expanded correction asset', (tester) async {
    await _renderAsset(
      tester,
      state: _FeedbackAssetState.correction,
      outputName: 'correction-expanded.png',
    );
  });

  testWidgets('renders the expanded natural-expression asset', (tester) async {
    await _renderAsset(
      tester,
      state: _FeedbackAssetState.natural,
      outputName: 'natural-expanded.png',
    );
  });
}

Future<void> _renderAsset(
  WidgetTester tester, {
  required _FeedbackAssetState state,
  required String outputName,
}) async {
  tester.view.devicePixelRatio = 2;
  tester.view.physicalSize = const Size(840, 1440);
  addTearDown(tester.view.resetDevicePixelRatio);
  addTearDown(tester.view.resetPhysicalSize);

  await tester.pumpWidget(
    MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: _fixtureTheme(),
      home: RepaintBoundary(
        key: _assetBoundaryKey,
        child: _FeedbackAssetCanvas(state: state),
      ),
    ),
  );
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 100));

  if (state != _FeedbackAssetState.collapsed) {
    await tester.tap(
      find.byKey(const Key('inline-language-optimize')),
      warnIfMissed: false,
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 250));
  }

  expect(
    find.byKey(Key('practice-message-user-${state.name}')),
    findsOneWidget,
  );
  if (state == _FeedbackAssetState.correction) {
    expect(find.text('纠错'), findsOneWidget);
  }
  if (state == _FeedbackAssetState.natural) {
    expect(find.text('更自然的表达'), findsOneWidget);
  }

  await _captureAsset(tester, outputName);
}

Future<void> _captureAsset(WidgetTester tester, String outputName) async {
  final boundary = tester.renderObject<RenderRepaintBoundary>(
    find.byKey(_assetBoundaryKey),
  );
  await tester.runAsync(() async {
    final image = await boundary.toImage(pixelRatio: 2);
    final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
    if (bytes == null) throw StateError('Unable to encode $outputName.');
    final directory = Directory(_outputDirectory)..createSync(recursive: true);
    await File('${directory.path}/$outputName').writeAsBytes(
      bytes.buffer.asUint8List(bytes.offsetInBytes, bytes.lengthInBytes),
      flush: true,
    );
    image.dispose();
  });
}

ThemeData _fixtureTheme() {
  final theme = SpeakUpTheme.light;
  const fallback = <String>['Roboto'];
  final buttonTextStyle = theme.textButtonTheme.style?.textStyle?.resolve(
    const <WidgetState>{},
  );
  return theme.copyWith(
    textTheme: theme.textTheme.apply(
      fontFamily: 'SpeakUpFixtureCjk',
      fontFamilyFallback: fallback,
    ),
    primaryTextTheme: theme.primaryTextTheme.apply(
      fontFamily: 'SpeakUpFixtureCjk',
      fontFamilyFallback: fallback,
    ),
    textButtonTheme: TextButtonThemeData(
      style: theme.textButtonTheme.style?.copyWith(
        textStyle: WidgetStatePropertyAll(
          buttonTextStyle?.copyWith(
            fontFamily: 'SpeakUpFixtureCjk',
            fontFamilyFallback: fallback,
          ),
        ),
      ),
    ),
  );
}

Future<void> _loadFixtureFonts() async {
  final flutterRoot = _findFlutterRoot();
  final materialFonts = '$flutterRoot/bin/cache/artifacts/material_fonts';
  await _loadFontFamily('Roboto', <String>[
    '$materialFonts/Roboto-Regular.ttf',
    '$materialFonts/Roboto-Medium.ttf',
    '$materialFonts/Roboto-Bold.ttf',
  ]);
  await _loadFontFamily('MaterialIcons', <String>[
    '$materialFonts/MaterialIcons-Regular.otf',
  ]);
  await _loadFontFamily('SpeakUpFixtureCjk', const <String>[
    '/System/Library/Fonts/Hiragino Sans GB.ttc',
  ]);
}

Future<void> _loadFontFamily(String family, List<String> paths) async {
  final loader = FontLoader(family);
  for (final path in paths) {
    final bytes = await File(path).readAsBytes();
    loader.addFont(Future<ByteData>.value(ByteData.sublistView(bytes)));
  }
  await loader.load();
}

String _findFlutterRoot() {
  final configured = Platform.environment['FLUTTER_ROOT'];
  if (configured != null && configured.isNotEmpty) return configured;
  var directory = File(Platform.resolvedExecutable).parent;
  while (directory.parent.path != directory.path) {
    if (File('${directory.path}/packages/flutter/pubspec.yaml').existsSync()) {
      return directory.path;
    }
    directory = directory.parent;
  }
  throw StateError('Unable to locate FLUTTER_ROOT for fixture fonts.');
}

final class _FeedbackAssetCanvas extends StatelessWidget {
  const _FeedbackAssetCanvas({required this.state});

  final _FeedbackAssetState state;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Stack(
        fit: StackFit.expand,
        children: [
          const SpeakUpAmbientBackground(),
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 42, 24, 42),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const PracticeMessageBubble(
                  message: PracticeMessage(
                    id: 'assistant-prompt',
                    role: PracticeMessageRole.assistant,
                    text: 'Tell me about a time you had to change your plan.',
                  ),
                ),
                const SizedBox(height: 14),
                PracticeMessageBubble(
                  message: PracticeMessage(
                    id: 'user-${state.name}',
                    role: PracticeMessageRole.user,
                    text:
                        'I change the plan because the deadline was tight, '
                        'and finally we finish on time.',
                  ),
                  feedbackProjection: _projectionFor(state),
                  onFeedbackRepractice: state == _FeedbackAssetState.correction
                      ? (_) {}
                      : null,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

SpeechFeedbackProjection _projectionFor(_FeedbackAssetState state) {
  final correction = SpeechFeedbackItem(
    feedbackItemId: 'feedback-correction',
    evaluationId: 'evaluation-feedback-assets',
    position: 1,
    kind: SpeechFeedbackItemKind.correction,
    anchor: const SpeechFeedbackAnchor(
      evidenceRefId: 'user-answer',
      startUtf8Byte: 0,
      endUtf8Byte: 17,
      originalExcerpt: 'I change the plan',
    ),
    explanation: '这件事已经发生，change 要使用过去式。',
    suggestedText: 'I changed the plan',
    repracticeMode: SpeechFeedbackRepracticeMode.sameQuestion,
    createdAt: DateTime.utc(2026, 8, 28, 9, 0, 1),
  );
  final natural = SpeechFeedbackItem(
    feedbackItemId: 'feedback-natural',
    evaluationId: 'evaluation-feedback-assets',
    position: 2,
    kind: SpeechFeedbackItemKind.recommendedExpression,
    anchor: const SpeechFeedbackAnchor(
      evidenceRefId: 'user-answer',
      startUtf8Byte: 0,
      endUtf8Byte: 17,
      originalExcerpt: 'I change the plan',
    ),
    explanation: '用 adjusted 和 delivered 更自然地说明调整方案并按时交付。',
    suggestedText:
        'I adjusted the plan to meet the deadline, and we still delivered '
        'on time.',
    repracticeMode: SpeechFeedbackRepracticeMode.none,
    createdAt: DateTime.utc(2026, 8, 28, 9, 0, 2),
  );
  final items = switch (state) {
    _FeedbackAssetState.collapsed => <SpeechFeedbackItem>[correction, natural],
    _FeedbackAssetState.correction => <SpeechFeedbackItem>[correction],
    _FeedbackAssetState.natural => <SpeechFeedbackItem>[natural],
  };
  final feedback = SpeechFeedback(
    evaluationId: 'evaluation-feedback-assets',
    source: const SpeechFeedbackSource(
      kind: SpeechFeedbackSourceKind.practiceTurn,
      sourceId: '20000000-0000-4000-8000-000000000001',
      contextId: '30000000-0000-4000-8000-000000000001',
    ),
    feedbackStatus: SpeechFeedbackStatus.ready,
    scoreabilityStatus: SpeechFeedbackScoreabilityStatus.provisional,
    summary: 'Use the past tense and a more natural expression.',
    reasonCodes: const [],
    items: items,
    acousticAssessment: const SpeechFeedbackAcousticAssessment.notAssessed(
      reason: 'ACOUSTIC_EVIDENCE_UNAVAILABLE',
    ),
    statusUrl: _statusUrl,
    createdAt: DateTime.utc(2026, 8, 28, 9),
    updatedAt: DateTime.utc(2026, 8, 28, 9, 0, 2),
  );
  return SpeechFeedbackProjection(
    sourceKey: 'feedback-assets-${state.name}',
    statusUrl: _statusUrl,
    feedback: feedback,
    isPolling: false,
    canRetry: false,
  );
}

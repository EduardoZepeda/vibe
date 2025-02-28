import { useTranslation } from 'react-i18next'
import LanguageInput from '~/components/LanguageInput'
import Layout from '~/components/Layout'
import ModelOptions from '~/components/Params'
import TextArea from '~/components/TextArea'
import { cx } from '~/lib/utils'
import AudioInput from '~/pages/home/AudioInput'
import AudioPlayer from './AudioPlayer'
import ProgressPanel from './ProgressPanel'
import { viewModel } from './viewModel'
import AudioDeviceInput from '~/components/AudioDeviceInput'
import { ReactComponent as FileIcon } from '~/icons/file.svg'
import { ReactComponent as MicrphoneIcon } from '~/icons/microphone.svg'
import { ReactComponent as LinkIcon } from '~/icons/link.svg'
import { useEffect } from 'react'
import { webviewWindow } from '@tauri-apps/api'

export default function Home() {
	const { t } = useTranslation()
	const vm = viewModel()

	async function showWindow() {
		const currentWindow = webviewWindow.getCurrentWebviewWindow()
		await currentWindow.show()
		if (import.meta.env.PROD) {
			await currentWindow.setFocus()
		}
	}

	useEffect(() => {
		showWindow()
	}, [])

	return (
		<Layout>
			<div role="tablist" className="tabs tabs-lifted flex m-auto mt-5">
				<a
					role="tab"
					onClick={() => vm.preference.setHomeTabIndex(0)}
					className={cx('tab [--tab-border-color:gray]', vm.preference.homeTabIndex === 0 && 'tab-active')}>
					<MicrphoneIcon className="w-[18px] h-[18px]" />
				</a>
				<a
					role="tab"
					onClick={() => vm.preference.setHomeTabIndex(1)}
					className={cx('tab [--tab-border-color:gray]', vm.preference.homeTabIndex === 1 && 'tab-active')}>
					<FileIcon className="w-[18px] h-[18px]" />
				</a>
				<a role="tab" onClick={vm.switchToLinkTab} className={cx('tab [--tab-border-color:gray]', vm.preference.homeTabIndex === 2 && 'tab-active')}>
					<LinkIcon className="w-[18px] h-[18px]" />
				</a>
			</div>

			{vm.preference.homeTabIndex === 0 && (
				<>
					<div className="flex w-[300px] flex-col m-auto">
						<div className="">
							<AudioDeviceInput device={vm.inputDevice} setDevice={vm.setInputDevice} devices={vm.devices} type="input" />
							<AudioDeviceInput device={vm.outputDevice} setDevice={vm.setOutputDevice} devices={vm.devices} type="output" />
							<label className="label cursor-pointer mt-2 mb-5">
								<span className="label-text">{t('common.save-record-in-documents-folder')}</span>
								<input
									type="checkbox"
									className="toggle toggle-primary"
									onChange={(e) => vm.preference.setStoreRecordInDocuments(e.target.checked)}
									checked={vm.preference.storeRecordInDocuments}
								/>
							</label>
						</div>
						{!vm.isRecording && (
							<button onMouseDown={() => vm.startRecord()} className="btn btn-primary mt-3">
								{t('common.start-record')}
							</button>
						)}

						{vm.isRecording && (
							<>
								<button onMouseDown={vm.stopRecord} className="btn relative btn-success mt-3">
									<span className="loading loading-spinner"></span>
									{t('common.stop-and-transcribe')}
								</button>
							</>
						)}

						<ModelOptions options={vm.preference.modelOptions} setOptions={vm.preference.setModelOptions} />
					</div>
				</>
			)}
			{vm.preference.homeTabIndex === 1 && (
				<>
					<div className="flex w-[300px] flex-col m-auto">
						<div className="join join-vertical">
							<LanguageInput />
							{!vm.files.length && <AudioInput onClick={vm.selectFiles} />}
						</div>
						{vm.audio && (
							<div>
								{vm.files.length ? (
									<AudioPlayer label={vm?.files?.[0].name} onLabelClick={() => vm.openPath(vm?.files?.[0])} audio={vm.audio} />
								) : null}

								{!vm.loading && (
									<div onMouseDown={vm.selectFiles} className={cx('text-xs text-base-content font-medium cursor-pointer mb-3 mt-1')}>
										{t('common.change-file')}
									</div>
								)}
							</div>
						)}
						{vm.audio && !vm.loading && (
							<>
								<button onMouseDown={() => vm.transcribe(vm.files[0].path)} className="btn btn-primary mt-3">
									{t('common.transcribe')}
								</button>
								<ModelOptions options={vm.preference.modelOptions} setOptions={vm.preference.setModelOptions} />
							</>
						)}
					</div>
					<div className="h-20" />
					{vm.loading && <ProgressPanel isAborting={vm.isAborting} onAbort={vm.onAbort} progress={vm.progress} />}
					{(vm.segments || vm.loading) && (
						<div className="flex flex-col mt-5 items-center w-[90%] max-w-[1000px] h-[84vh] m-auto">
							<TextArea
								setSegments={vm.setSegments}
								file={vm.files?.[0]}
								placeholder={t('common.transcript-will-displayed-shortly')}
								segments={vm.segments}
								readonly={vm.loading}
							/>
						</div>
					)}
				</>
			)}

			{vm.preference.homeTabIndex === 2 && (
				<div className="flex w-[300px] flex-col m-auto">
					<div className="flex flex-col gap-0 mt-5">
						<input
							type="text"
							className="input input-bordered"
							value={vm.audioUrl}
							onChange={(event) => vm.setAudioUrl(event.target.value)}
							placeholder="https://www.youtube.com/watch?v=aj8-ABRl1Jo"
							onKeyDown={(event) => (event.key === 'Enter' ? vm.downloadAudio() : null)}
						/>

						{vm.downloadingAudio ? (
							<button className="btn relative btn-success mt-3">
								<span className="loading loading-spinner"></span>
							</button>
						) : (
							<>
								<label className="label cursor-pointer mt-2 mb-5">
									<span className="label-text">{t('common.save-record-in-documents-folder')}</span>
									<input
										type="checkbox"
										className="toggle toggle-primary"
										onChange={(e) => vm.preference.setStoreRecordInDocuments(e.target.checked)}
										checked={vm.preference.storeRecordInDocuments}
									/>
								</label>

								<button onMouseDown={vm.downloadAudio} className="btn btn-primary mt-0">
									{t('common.download-file')}
								</button>
								<ModelOptions options={vm.preference.modelOptions} setOptions={vm.preference.setModelOptions} />
							</>
						)}
					</div>
				</div>
			)}
		</Layout>
	)
}

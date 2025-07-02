const React = require('react')

const ModalOKCancel = require('./modal-ok-cancel')
const { dispatch, dispatcher } = require('../lib/dispatcher')
const { t } = require('../lib/i18n')

module.exports = class RemoveTorrentModal extends React.Component {
  render () {
    const state = this.props.state
    const message = state.modal.deleteData
      ? t('removeTorrentModal.removeAndDelete')
      : t('removeTorrentModal.removeOnly')
    const buttonText = state.modal.deleteData ? t('removeTorrentModal.removeData') : t('removeTorrentModal.remove')

    return (
      <div>
        <p><strong>{message}</strong></p>
        <ModalOKCancel
          cancelText={t('modal.cancel')}
          onCancel={dispatcher('exitModal')}
          okText={buttonText}
          onOK={handleRemove}
        />
      </div>
    )

    function handleRemove () {
      dispatch('deleteTorrent', state.modal.infoHash, state.modal.deleteData)
      dispatch('exitModal')
    }
  }
}
